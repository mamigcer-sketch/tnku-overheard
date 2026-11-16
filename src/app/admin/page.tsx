"use client";

import { useEffect, useState } from 'react';
import {
  getPendingMessages,
  getActiveMessage,
  approveMessage,
  rejectMessage,
  clearActiveMessage,
  updateMessage,
  deleteAllMessages,
} from './actions';
import {
  ShieldAlert,
  Flame,
  Trash2,
  Send,
  RefreshCw,
  Camera,
  X,
  Image as ImageIcon,
  Edit3,
  Check,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, { label: string; badge: string }> = {
  PARTY_ITIRAF: { label: '🕯️ MASUM İTİRAF', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  PARTY_LINC: { label: '🔥 BÜYÜK GÜNAH', badge: 'bg-red-500/20 text-red-300 border-red-500/40' },
  PARTY_LİNÇ: { label: '🔥 BÜYÜK GÜNAH', badge: 'bg-red-500/20 text-red-300 border-red-500/40' },
  PARTY_REZIL: { label: '💀 REZİLLİK', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  PARTY_IFSA: { label: '👁️ İFŞA & SIR', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  PARTY_OVERHEARD: { label: '🕯️ İTİRAF', badge: 'bg-red-500/20 text-red-300 border-red-500/40' },
};

export default function AdminConfessionPage() {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [activeMessage, setActiveMessage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Düzenleme State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('PARTY_LINC');

  // Fotoğraf Modu State
  const [showPhotoTools, setShowPhotoTools] = useState(false);
  const [isPhotoActive, setIsPhotoActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const notify = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  };

  const fetchAll = async () => {
    try {
      const [pending, active] = await Promise.all([
        getPendingMessages(),
        getActiveMessage(),
      ]);
      setPendingList(pending || []);
      setActiveMessage(active || null);

      const photoRes = await fetch(`/api/photo?t=${Date.now()}`);
      const photoData = await photoRes.json();
      if (photoData) setIsPhotoActive(photoData.active);
    } catch (e) {
      console.error('Admin veri çekme hatası:', e);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await approveMessage(id);
      await fetchAll();
      notify('🔥 Günah DJ Ekranına Fırlatıldı!');
    } catch (e) {
      notify('❌ Onaylama hatası!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await rejectMessage(id);
      await fetchAll();
      notify('🗑️ Günah çöpe atıldı.');
    } catch (e) {
      notify('❌ Silme hatası!');
    } finally {
      setLoading(false);
    }
  };

  const handleClearScreen = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await clearActiveMessage();
      await fetchAll();
      notify('🧹 DJ ekranı temizlendi (Bekleme moduna geçildi).');
    } catch (e) {
      notify('❌ Ekran temizlenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('DİKKAT! Kuyruktaki ve yayındaki TÜM itiraflar kalıcı olarak silinecek. Emin misin?')) {
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      await deleteAllMessages();
      setEditingId(null);
      await fetchAll();
      notify('💥 Tüm itiraflar kalıcı olarak silindi!');
    } catch (e) {
      notify('❌ Toplu silme sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditLocation(item.location || 'PARTY_LINC');
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await updateMessage(id, editContent.trim(), editLocation);
      setEditingId(null);
      await fetchAll();
      notify('✏️ Günah düzenlendi.');
    } catch (e) {
      notify('❌ Düzenleme kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Fotoğraf İşlemleri
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
      notify('📸 Fotoğraf DJ Ekranında Yayında!');
    } catch (e) {
      notify('❌ Yükleme hatası!');
    } finally {
      setLoading(false);
    }
  };

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
      notify('🔙 Günah Ekranına Geri Dönüldü!');
    } catch (e) {
      notify('❌ Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#040103] text-white p-4 md:p-8 flex flex-col items-center relative overflow-x-hidden select-none">
      <div className="w-full max-w-[650px] bg-[#0b0407]/95 backdrop-blur-2xl border border-red-500/20 rounded-[2.5rem] p-5 md:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-wider text-white">
                GÜNAH MODERASYONU
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Onay Bekleyen: <span className="text-red-400 font-black">{pendingList.length}</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchAll}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {msg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-center text-xs font-black text-red-200 animate-pulse">
            {msg}
          </div>
        )}

        {/* ŞU AN DEV EKRANDA YAYINDA OLAN GÜNAH */}
        <div className="mb-7 p-5 rounded-3xl bg-gradient-to-br from-red-950/50 to-black border border-red-500/40 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-[0.2em] text-red-400 uppercase flex items-center gap-1.5">
              <Flame size={14} className="animate-pulse" /> ŞU AN DJ EKRANINDA YAYINDA
            </span>
            {activeMessage && (
              <button
                onClick={handleClearScreen}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 transition-all cursor-pointer"
              >
                <EyeOff size={12} /> EKRANI TEMİZLE
              </button>
            )}
          </div>

          {activeMessage ? (
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border mb-2 ${
                  CATEGORY_LABELS[activeMessage.location]?.badge || 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}
              >
                {CATEGORY_LABELS[activeMessage.location]?.label || '🕯️ İTİRAF'}
              </span>
              <p className="text-base md:text-lg font-bold text-white leading-snug break-words">
                “{activeMessage.content}”
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-2">
              Şu an ekranda aktif bir günah yok. Aşağıdaki kuyruktan birini seçip ekrana fırlat!
            </p>
          )}
        </div>

        {/* ONAY BEKLEYEN GÜNAHLAR LİSTESİ */}
        <div className="mb-8">
          <h2 className="text-xs font-black tracking-[0.2em] text-gray-400 uppercase mb-3">
            Onay Bekleyen Günahlar ({pendingList.length})
          </h2>

          {pendingList.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-white/15 text-center text-gray-500 text-xs">
              Henüz yeni günah düşmedi. Masalardan itiraflar geldikçe burada sıralanacak...
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
              {pendingList.map((item) => {
                const catInfo = CATEGORY_LABELS[item.location] || CATEGORY_LABELS.PARTY_ITIRAF;
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-red-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${catInfo.badge}`}>
                        {catInfo.label}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(item.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2.5 mb-3">
                        <select
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full p-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                        >
                          <option value="PARTY_ITIRAF">🕯️ Masum İtiraf</option>
                          <option value="PARTY_LINC">🔥 Büyük Günah</option>
                          <option value="PARTY_REZIL">💀 Rezillik</option>
                          <option value="PARTY_IFSA">👁️ İfşa & Sır</option>
                        </select>
                        <textarea
                          rows={3}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 rounded-xl bg-black border border-red-500/40 text-sm text-white outline-none resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check size={14} /> KAYDET
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                          >
                            İPTAL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm md:text-base font-medium text-gray-100 leading-relaxed mb-4 break-words">
                        {item.content}
                      </p>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          disabled={loading}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Send size={14} /> DJ EKRANINA VER
                        </button>

                        <button
                          onClick={() => startEditing(item)}
                          disabled={loading}
                          title="Sansürle / Düzenle"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 text-amber-300 transition-all cursor-pointer"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={loading}
                          title="Çöpe At"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLLAPSIBLE CANLI FOTOĞRAF KONTROLÜ */}
        <div className="border-t border-white/10 pt-4 mb-5">
          <button
            onClick={() => setShowPhotoTools(!showPhotoTools)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black tracking-wider text-gray-300 uppercase cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Camera size={16} className="text-amber-400" /> Canlı Fotoğraf Modu (Opsiyonel)
            </span>
            {showPhotoTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showPhotoTools && (
            <div className="mt-3 p-4 bg-black/50 border border-white/10 rounded-2xl space-y-3">
              {isPhotoActive ? (
                <button
                  onClick={handleClosePhoto}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X size={16} /> FOTOĞRAFI KAPAT ➔ GÜNAHLARA DÖN
                </button>
              ) : (
                <>
                  <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-400/50 text-gray-300">
                    <ImageIcon size={18} className="text-amber-400" />
                    <span className="text-xs font-bold">
                      {selectedImage ? 'Başka Fotoğraf Seç' : 'Galeriden Fotoğraf Seç'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                  {selectedImage && (
                    <button
                      onClick={handleShowPhotoOnScreen}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera size={16} /> FOTOĞRAFI EKRANA VER
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* TÜM İTİRAFLARI KALICI SİL BUTONU */}
        <button
          onClick={handleDeleteAll}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-red-600/15 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Trash2 size={16} /> TÜM İTİRAFLARI SİL
        </button>
      </div>
    </main>
  );
}