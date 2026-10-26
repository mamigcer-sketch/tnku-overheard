"use client";

import { useEffect, useState, useRef } from 'react';
import { getPendingMessages, approveMessage, rejectMessage, clearActiveMessage, updateMessage } from './actions';
import { Check, X, ShieldAlert, Loader2, Skull, Ghost, Zap, RefreshCw, MonitorX, Edit3, Save, Trash2, ImagePlus, UploadCloud } from 'lucide-react';

export default function PartyAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Fotoğraf Yükleme State'leri
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await getPendingMessages();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClearScreen = async () => {
    if (confirm("Ekrandaki içeriği kaldırıp bekleme ekranına dönmek istediğine emin misin?")) {
      try {
        await clearActiveMessage();
        alert("Ekran temizlendi! Sahnede bekleme ekranı dönüyor.");
      } catch (error) {
        console.error("Ekran temizlenirken hata:", error);
      }
    }
  };

  const handleRejectAll = () => {
    if (messages.length === 0) return;
    if (confirm(`Bekleyen ${messages.length} mesajın hepsini çöpe atmak istediğine emin misin?`)) {
      const messagesToDelete = [...messages];
      setMessages([]); 
      Promise.allSettled(messagesToDelete.map(m => rejectMessage(m.id)))
        .then(() => console.log("Toplu silme başarılı"));
    }
  };

  // Galeriden fotoğraf seçildiğinde optimize edip Base64 formatına çevirir
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setSelectedImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Fotoğrafı sahneye direkt fırlatma
  const handleBroadcastImage = async () => {
    if (!selectedImage) return;
    setIsUploadingImg(true);

    try {
      const res = await fetch("/api/parti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: selectedImage,
          location: "PARTY_PHOTO",
          approved: true,
        }),
      });

      if (res.ok) {
        alert("Fotoğraf sahneye yansıtıldı!");
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert("Fotoğraf gönderilirken hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası!");
    } finally {
      setIsUploadingImg(false);
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
    setEditLocation(msg.location || 'PARTY_ITIRAF');
  };

  const handleSaveEdit = async (id: string) => {
    await updateMessage(id, editContent, editLocation);
    setEditingId(null);
    fetchMessages();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#ff6a00]/5 pointer-events-none" />
        <ShieldAlert size={64} className="text-[#ff6a00] mb-6 relative z-10" />
        <h1 className="text-2xl font-black mb-8 tracking-widest text-[#ff6a00] relative z-10">MODERASYON GİRİŞİ</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 relative z-10">
          <input 
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin Şifresi"
            className="w-full bg-[#111] border border-white/20 rounded-xl p-4 text-center text-xl tracking-widest outline-none focus:border-[#ff6a00] transition-colors"
          />
          <button type="submit" className="w-full bg-[#ff6a00] hover:bg-[#ff8a33] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)]">GİRİŞ YAP</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050308] text-white p-4 pb-24 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(255,106,0,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,rgba(157,0,255,0.08)_0%,transparent_50%)]" />

      <div className="max-w-xl mx-auto relative z-10">
        
        <header className="flex items-center justify-between py-6 border-b border-white/10 mb-6">
          <h1 className="text-xl font-black tracking-widest text-white flex items-center gap-2">
            <Skull size={24} className="text-[#ff6a00]" /> KONTROL 
          </h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualRefresh}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
            >
              <RefreshCw size={18} className={`${isRefreshing ? "animate-spin text-white" : "text-gray-400"}`} />
            </button>
            
            <div className="text-sm font-bold bg-white/5 px-4 py-2.5 rounded-lg border border-white/10">
              BEKLEYEN: <span className="text-[#ff6a00]">{messages.length}</span>
            </div>
          </div>
        </header>

        {/* FOTOĞRAF YÜKLEME KUTUSU */}
        <div className="mb-6 bg-black/60 border border-[#ff6a00]/30 p-4 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3 text-sm font-black tracking-widest text-[#ffaa77]">
            <ImagePlus size={18} className="text-[#ff6a00]" />
            SAHNEYE YATAY FOTOĞRAF YANSIT
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            id="admin-photo-input"
          />

          {!selectedImage ? (
            <label 
              htmlFor="admin-photo-input"
              className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-[#ff6a00]/50 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center"
            >
              <UploadCloud size={32} className="text-[#ff6a00] mb-2" />
              <span className="text-sm font-bold text-gray-200">Galeriden Yatay Fotoğraf Seç</span>
              <span className="text-[11px] text-gray-500 mt-1">PNG, JPG veya WEBP</span>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/20 bg-black">
                <img src={selectedImage} alt="Önizleme" className="w-full h-full object-contain" />
                <button 
                  onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <button 
                onClick={handleBroadcastImage}
                disabled={isUploadingImg}
                className="w-full flex items-center justify-center gap-2 bg-[#ff6a00] hover:bg-[#ff8a33] text-black font-black py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)] disabled:opacity-50"
              >
                {isUploadingImg ? <Loader2 size={18} className="animate-spin" /> : <><UploadCloud size={18} /> FOTOĞRAFI SAHNEYE YANSIT</>}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <button 
            onClick={handleClearScreen}
            className="w-full flex items-center justify-center gap-2 bg-[#ff6a00]/10 hover:bg-[#ff6a00]/20 border border-[#ff6a00]/30 hover:border-[#ff6a00] text-[#ffaa77] py-3.5 rounded-xl font-black tracking-widest transition-all"
          >
            <MonitorX size={20} /> EKRANI TEMİZLE
          </button>

          <button 
            onClick={handleRejectAll}
            disabled={messages.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black tracking-widest transition-all ${
              messages.length === 0 
              ? 'bg-gray-900 text-gray-700 border border-gray-800 cursor-not-allowed'
              : 'bg-black hover:bg-red-950/40 border border-white/10 hover:border-red-500 text-gray-400 hover:text-red-400'
            }`}
          >
            <Trash2 size={20} /> TÜMÜNÜ ÇÖPE AT
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ff6a00]" size={40} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-600 py-20 font-bold tracking-widest flex flex-col items-center gap-4">
            <Check size={48} className="text-green-500/20" />
            Bekleyen Mesaj Yok
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              let Icon = Skull;
              let label = "İTİRAF";
              let color = "text-[#ff6a00]";
              let bg = "bg-[#ff6a00]/10 border-[#ff6a00]/30";
              
              if (msg.location?.includes('LINC') || msg.location?.includes('LİNÇ') || msg.location?.includes('REZIL')) { 
                Icon = Ghost; 
                label = "LİNÇ@"; 
                color = "text-[#9d00ff]"; 
                bg = "bg-[#9d00ff]/10 border-[#9d00ff]/30";
              }
              
              if (msg.location?.includes('OVERHEARD')) { 
                Icon = Zap; 
                label = "DUYDUM"; 
                color = "text-[#00ff33]"; 
                bg = "bg-[#00ff33]/10 border-[#00ff33]/30";
              }

              const isEditing = editingId === msg.id;

              return (
                <div key={msg.id} className="bg-[#0a060d] border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 text-xs font-black tracking-widest ${color} ${bg} px-3 py-1.5 rounded-md border`}>
                      <Icon size={14} /> {label}
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
                        className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white text-lg font-bold outline-none focus:border-[#ff6a00] resize-none h-24"
                        maxLength={150}
                      />
                      
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setEditLocation('PARTY_ITIRAF')}
                          className={`flex-1 py-2 text-xs font-black rounded-lg border transition-all ${editLocation === 'PARTY_ITIRAF' ? 'bg-[#ff6a00]/20 border-[#ff6a00] text-[#ffaa77]' : 'bg-white/5 border-white/10 text-gray-400'}`}
                        >
                          İTİRAF
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditLocation('PARTY_LINC')}
                          className={`flex-1 py-2 text-xs font-black rounded-lg border transition-all ${editLocation?.includes('LINC') || editLocation?.includes('REZIL') ? 'bg-[#9d00ff]/20 border-[#9d00ff] text-[#ccaaff]' : 'bg-white/5 border-white/10 text-gray-400'}`}
                        >
                          LİNÇ@
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditLocation('PARTY_OVERHEARD')}
                          className={`flex-1 py-2 text-xs font-black rounded-lg border transition-all ${editLocation === 'PARTY_OVERHEARD' ? 'bg-[#00ff33]/20 border-[#00ff33] text-[#aaffbb]' : 'bg-white/5 border-white/10 text-gray-400'}`}
                        >
                          DUYDUM
                        </button>
                      </div>

                      <button 
                        onClick={() => handleSaveEdit(msg.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] mt-2"
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