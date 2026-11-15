"use client";

import { useEffect, useState } from 'react';
import { adminAddVote, resetVotes } from '../actions';
import { ShieldAlert, Flame, Disc, Music2, RotateCcw, Plus, RefreshCw, Camera, X, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPhotoActive, setIsPhotoActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/parti?t=${Date.now()}`);
      const data = await res.json();
      if (data) setStats(data);

      // Fotoğraf durumunu da kontrol et
      const photoRes = await fetch(`/api/photo?t=${Date.now()}`);
      const photoData = await photoRes.json();
      if (photoData) setIsPhotoActive(photoData.active);
    } catch (e) {
      console.error("Admin veri çekme hatası:", e);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fotoğraf Yükleme (Base64)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Ekrana Fotoğrafı Gönder
  const handleShowPhotoOnScreen = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload', photoUrl: selectedImage }),
      });
      setIsPhotoActive(true);
      setMsg("📸 Fotoğraf DJ Ekranında Yayında!");
    } catch (e) {
      setMsg("❌ Yükleme hatası!");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2500);
    }
  };

  // Ekrana Oylamayı Geri Getir
  const handleClosePhoto = async () => {
    setLoading(true);
    try {
      await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      setIsPhotoActive(false);
      setSelectedImage(null);
      setMsg("🔙 Oylama Ekranına Geri Dönüldü!");
    } catch (e) {
      setMsg("❌ Hata oluştu.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const handleAddVote = async (genre: 'POP' | 'RAP' | 'ROCK') => {
    if (loading) return;
    setLoading(true);
    try {
      await adminAddVote(genre);
      await fetchStats();
      setMsg(`✅ 1 Adet ${genre} oyu eklendi!`);
    } catch (e) {
      setMsg("❌ Hata oluştu.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const handleReset = async () => {
    if (!confirm("TÜM OYLARI SIFIRLAMAK İSTEDİĞİNE EMİN MİSİN?")) return;
    setLoading(true);
    try {
      await resetVotes();
      await fetchStats();
      setMsg("🧹 Tüm oylar sıfırlandı!");
    } catch (e) {
      setMsg("❌ Sıfırlama hatası.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const options = [
    { id: 'POP', title: 'TÜRKÇE POP', icon: Flame, color: 'border-pink-500/40 bg-pink-500/10 text-pink-400', btnBg: 'bg-pink-600 hover:bg-pink-500' },
    { id: 'RAP', title: 'TÜRKÇE RAP', icon: Disc, color: 'border-purple-500/40 bg-purple-500/10 text-purple-400', btnBg: 'bg-purple-600 hover:bg-purple-500' },
    { id: 'ROCK', title: 'TÜRKÇE ROCK', icon: Music2, color: 'border-amber-500/40 bg-amber-500/10 text-amber-400', btnBg: 'bg-amber-600 hover:bg-amber-500' },
  ];

  return (
    <main className="min-h-screen bg-[#050208] text-white p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden select-none">
      <div className="w-full max-w-[550px] bg-[#0a0710]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-wider text-white">DJ & ADMİN PANELİ</h1>
              <p className="text-xs text-gray-400 font-medium">Sahne & Fotoğraf Yönetimi</p>
            </div>
          </div>
          
          <button onClick={fetchStats} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {msg && (
          <div className="mb-6 p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-center text-xs font-black text-purple-300 animate-pulse">
            {msg}
          </div>
        )}

        {/* 📸 FOTOĞRAF YÜKLEME VE EKRAN MODU KONTROLÜ */}
        <div className="mb-8 p-5 bg-purple-950/30 border border-purple-500/30 rounded-3xl backdrop-blur-md">
          <h2 className="text-xs font-black tracking-[0.2em] text-purple-400 uppercase mb-3 flex items-center gap-2">
            <Camera size={18} /> Gecenin En Güzel Karesi (Canlı Fotoğraf)
          </h2>

          {isPhotoActive ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-black text-center animate-pulse">
                📸 FOTOĞRAF ŞU AN DJ EKRANINDA YAYINDA!
              </div>
              <button
                onClick={handleClosePhoto}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <X size={18} /> FOTOĞRAFI KAPAT ➔ OYLAMAYA DÖN
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-purple-400/50 hover:bg-white/5 transition-all text-gray-300">
                <ImageIcon size={22} className="text-purple-400" />
                <span className="text-xs font-black">
                  {selectedImage ? "Başka Fotoğraf Seç" : "Galeriden Fotoğraf Seç"}
                </span>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>

              {selectedImage && (
                <div className="space-y-3">
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/20 shadow-md">
                    <img src={selectedImage} alt="Önizleme" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={handleShowPhotoOnScreen}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera size={18} /> DJ EKRANINA GÖNDER 🔥
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hızlı Oy Ekle */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-black tracking-[0.2em] text-gray-400 uppercase">Hızlı Oy Ekle (Hype)</h2>
          {options.map((item) => {
            const count = stats?.stats ? stats.stats[item.id]?.count || 0 : 0;
            const percent = stats?.stats ? stats.stats[item.id]?.percent || 0 : 0;
            const Icon = item.icon;

            return (
              <div key={item.id} className={`flex items-center justify-between p-3.5 rounded-2xl border ${item.color}`}>
                <div className="flex items-center gap-3">
                  <Icon size={22} />
                  <div>
                    <h3 className="font-black text-xs tracking-wide text-white">{item.title}</h3>
                    <span className="text-[10px] font-bold opacity-80">{percent}% ({count} Oy)</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddVote(item.id as any)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-xl text-white font-black text-xs flex items-center gap-1 cursor-pointer ${item.btnBg}`}
                >
                  <Plus size={14} /> +1 OY
                </button>
              </div>
            );
          })}
        </div>

        {/* Sıfırlama */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw size={16} /> TÜM OYLARI SIFIRLA
        </button>

      </div>
    </main>
  );
}