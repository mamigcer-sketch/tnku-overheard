"use client";

import { useEffect, useState } from 'react';
import { getPendingMessages, approveMessage, rejectMessage, clearActiveMessage } from './actions';
import { Check, X, ShieldAlert, Loader2, Flame, EyeOff, Ear, RefreshCw, MonitorX } from 'lucide-react';

export default function PartyAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verileri çekme fonksiyonu
  const fetchMessages = async () => {
    const data = await getPendingMessages();
    setMessages(data);
    setLoading(false);
  };

  // Manuel Yenileme Butonu İçin
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => setIsRefreshing(false), 500); // Dönme animasyonu biraz görünsün diye
  };

  // Ekranı Temizleme Butonu İçin (İntroya Dön)
  const handleClearScreen = async () => {
    if (confirm("Ekrandaki mesajı kaldırıp Party İntro ekranına dönmek istediğine emin misin?")) {
      try {
        await clearActiveMessage(); // actions.ts içinden çağırıyoruz
        alert("Ekran temizlendi! Sahnede Party İntro'su dönüyor.");
      } catch (error) {
        console.error("Ekran temizlenirken hata oluştu:", error);
        alert("Ekran temizlenemedi, bir hata oluştu.");
      }
    }
  };

  // Otomatik 3 saniyede bir yenileme
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
    // Ekranda anında yok hissi vermek için UI'dan hemen siliyoruz
    setMessages((prev) => prev.filter((m) => m.id !== id));
    
    if (actionType === 'APPROVE') {
      await approveMessage(id);
    } else {
      await rejectMessage(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-black mb-8 tracking-widest">MODERASYON GİRİŞİ</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input 
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin Şifresi"
            className="w-full bg-[#111] border border-white/20 rounded-xl p-4 text-center text-xl tracking-widest outline-none focus:border-red-500 transition-colors"
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all">GİRİŞ YAP</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 pb-24">
      <div className="max-w-xl mx-auto">
        
        <header className="flex items-center justify-between py-6 border-b border-white/10 mb-6">
          <h1 className="text-xl font-black tracking-widest text-red-500 flex items-center gap-2">
            <ShieldAlert size={24} /> KONTROL 
          </h1>
          
          <div className="flex items-center gap-3">
            {/* MANUEL YENİLEME BUTONU */}
            <button 
              onClick={handleManualRefresh}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
              title="Mesajları Yenile"
            >
              <RefreshCw size={18} className={`${isRefreshing ? "animate-spin text-white" : "text-gray-400"}`} />
            </button>
            
            <div className="text-sm font-bold bg-white/10 px-4 py-2.5 rounded-lg border border-white/5">
              BEKLEYEN: <span className="text-red-400">{messages.length}</span>
            </div>
          </div>
        </header>

        {/* EKRANI TEMİZLE BUTONU (Yeni) */}
        <button 
          onClick={handleClearScreen}
          className="w-full flex items-center justify-center gap-2 mb-8 bg-red-900/40 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-100 py-4 rounded-xl font-black tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
        >
          <MonitorX size={20} />
          EKRANI TEMİZLE (İNTROYA DÖN)
        </button>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-20 font-bold tracking-widest uppercase flex flex-col items-center gap-4">
            <Check size={48} className="text-green-500/50" />
            Ekrana Verilecek Mesaj Yok
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              
              let Icon = Flame;
              let label = "İTİRAF";
              let color = "text-red-400";
              
              if (msg.location === 'PARTY_REZIL') { Icon = EyeOff; label = "REZİL@"; color = "text-fuchsia-400"; }
              if (msg.location === 'PARTY_OVERHEARD') { Icon = Ear; label = "DUYDUM"; color = "text-cyan-400"; }

              return (
                <div key={msg.id} className="bg-[#111] border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden transition-all">
                  <div className={`flex items-center gap-2 text-xs font-black tracking-widest mb-3 ${color}`}>
                    <Icon size={14} /> {label}
                  </div>
                  
                  <p className="text-xl font-bold leading-snug mb-6">{msg.content}</p>
                  
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => handleAction(msg.id, 'REJECT')}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-white/10 hover:border-red-500/50 py-3 rounded-xl transition-all font-bold"
                    >
                      <X size={20} /> ÇÖPE AT
                    </button>
                    <button 
                      onClick={() => handleAction(msg.id, 'APPROVE')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/50 py-3 rounded-xl transition-all font-bold"
                    >
                      <Check size={20} /> EKRANA VER
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}