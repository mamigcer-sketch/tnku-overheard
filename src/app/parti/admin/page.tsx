"use client";

import { useEffect, useState } from 'react';
import { getPendingMessages, approveMessage, rejectMessage, clearActiveMessage, updateMessage } from './actions';
import { Check, X, ShieldAlert, Loader2, HelpCircle, RefreshCw, MonitorX, Edit3, Save, Trash2, Flag } from 'lucide-react';

export default function PartyAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const fetchMessages = async () => {
    const data = await getPendingMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearScreen = async () => {
    if (confirm("Ekrandaki soruyu kaldırıp bekleme ekranına dönmek istediğine emin misin?")) {
      try {
        await clearActiveMessage();
        alert("Ekran temizlendi! Sahnede bekleme ekranı dönüyor.");
      } catch (error) {
        console.error("Ekran temizlenirken hata oluştu:", error);
        alert("Ekran temizlenemedi, bir hata oluştu.");
      }
    }
  };

  // 🔥 KRİTİK DÜZELTME: Tümünü silme işlemi artık veritabanını şişirmesin diye sıralı çalışıyor
  const handleRejectAll = async () => {
    if (messages.length === 0) return;
    if (confirm(`Bekleyen ${messages.length} sorunun hepsini çöpe atmak istediğine emin misin? Bu işlem geri alınamaz!`)) {
      setLoading(true);
      try {
        for (const m of messages) {
          await rejectMessage(m.id);
        }
        setMessages([]); 
      } catch (error) {
        console.error("Toplu silme işleminde hata:", error);
        alert("Bazı mesajlar silinirken hata oluştu.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = sessionStorage.getItem('tnku_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem('tnku_admin_auth', 'true');
      fetchMessages();
    } else {
      alert("Yanlış Şifre!");
    }
  };

  const handleAction = async (id: string, actionType: 'APPROVE' | 'REJECT') => {
    // Ekranda anında kaybediyoruz
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (actionType === 'APPROVE') {
      await approveMessage(id);
    } else {
      await rejectMessage(id);
    }
  };

  const startEditing = (msg: any) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
    setEditLocation(msg.location);
  };

  const handleSaveEdit = async (id: string) => {
    await updateMessage(id, editContent, editLocation);
    setEditingId(null);
    fetchMessages();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
        <ShieldAlert size={64} className="text-red-600 mb-6 relative z-10" />
        <h1 className="text-2xl font-black mb-8 tracking-widest text-red-500 relative z-10">REDFLAG MODERASYON</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 relative z-10">
          <input 
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin Şifresi"
            className="w-full bg-[#111] border border-red-500/20 rounded-xl p-4 text-center text-xl tracking-widest outline-none focus:border-red-500 transition-colors shadow-[0_0_15px_rgba(255,0,0,0.1)]"
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,0,0.3)]">GİRİŞ YAP</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 pb-24 relative overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(255,0,0,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,255,50,0.05)_0%,transparent_50%)]" />

      <div className="max-w-xl mx-auto relative z-10">
        
        <header className="flex items-center justify-between py-6 border-b border-white/10 mb-6">
          <h1 className="text-xl font-black tracking-widest text-red-500 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
            <Flag size={24} fill="currentColor" /> REDFLAG KONTROL 
          </h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualRefresh}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
              title="Mesajları Yenile"
            >
              <RefreshCw size={18} className={`${isRefreshing ? "animate-spin text-white" : "text-red-400"}`} />
            </button>
            
            <div className="text-sm font-bold bg-white/5 px-4 py-2.5 rounded-lg border border-red-500/20">
              BEKLEYEN: <span className="text-red-400">{messages.length}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <button 
            onClick={handleClearScreen}
            className="w-full flex items-center justify-center gap-2 bg-red-950/50 hover:bg-red-900 border border-red-500/30 hover:border-red-500 text-red-100 py-3.5 rounded-xl font-black tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)]"
          >
            <MonitorX size={20} />
            EKRANDAKİ SORUYU KALDIR
          </button>

          <button 
            onClick={handleRejectAll}
            disabled={messages.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black tracking-widest transition-all ${
              messages.length === 0 
              ? 'bg-gray-900 text-gray-700 border border-gray-800 cursor-not-allowed'
              : 'bg-black hover:bg-red-950 border border-white/10 hover:border-red-500 text-gray-400 hover:text-red-400'
            }`}
          >
            <Trash2 size={20} />
            BEKLEYEN TÜM SORULARI ÇÖPE AT
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-20 font-bold tracking-widest uppercase flex flex-col items-center gap-4">
            <Check size={48} className="text-green-500/30" />
            Ekrana Verilecek Soru Yok
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              
              let Icon = HelpCircle;
              let label = "YENİ SORU";
              let color = "text-white";
              
              const isEditing = editingId === msg.id;

              return (
                <div key={msg.id} className="bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden transition-all">
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 text-xs font-black tracking-widest ${color} bg-white/5 px-3 py-1.5 rounded-md border border-white/10`}>
                      <Icon size={14} className="text-red-500" /> {label}
                    </div>
                    
                    {!isEditing && (
                      <button 
                        onClick={() => startEditing(msg)}
                        className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 transition-all font-bold"
                      >
                        <Edit3 size={13} /> Düzenle
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3 mb-6">
                      <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white text-lg font-bold outline-none focus:border-red-500 resize-none h-24"
                        maxLength={150}
                      />
                      <button 
                        onClick={() => handleSaveEdit(msg.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      >
                        <Save size={16} /> DEĞİŞİKLİKLERİ KAYDET
                      </button>
                    </div>
                  ) : (
                    <p className="text-xl font-bold leading-snug mb-6 text-gray-100">{msg.content}</p>
                  )}
                  
                  {!isEditing && (
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => handleAction(msg.id, 'REJECT')}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-white/10 hover:border-red-500/50 py-3 rounded-xl transition-all font-bold"
                      >
                        <X size={20} /> ÇÖPE AT
                      </button>
                      <button 
                        onClick={() => handleAction(msg.id, 'APPROVE')}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white text-gray-300 hover:text-black border border-white/10 hover:border-white py-3 rounded-xl transition-all font-bold shadow-lg"
                      >
                        <Check size={20} /> EKRANA VER
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}