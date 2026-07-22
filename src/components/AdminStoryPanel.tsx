"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Link as LinkIcon, Trash2, Clock, Eye, Send, Sparkles } from "lucide-react";

export default function AdminStoryPanel() {
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [storyText, setStoryText] = useState("");
  const [storyLink, setStoryLink] = useState("");

  // Örnek aktif hikayeler (Bunu veritabanından çekersin)
  const [activeStories, setActiveStories] = useState([
    { id: 1, text: "Kampüste olay var!", views: 142, time: "2 saat önce", img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80" },
    { id: 2, text: "Sınavlar açıklandı 😱", views: 89, time: "5 saat önce", img: "" }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Burada Prisma/Server Action ile hikayeyi veritabanına kaydedeceksin
    console.log("Hikaye fırlatıldı:", { imageUrl, storyText, storyLink });
    setIsAdding(false);
    setImageUrl("");
    setStoryText("");
    setStoryLink("");
  };

  const handleDelete = (id: number) => {
    // TODO: Hikaye silme işlemi
    setActiveStories(activeStories.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] rounded-[24px] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group">
      
      {/* Arka Plan Glow Efekti */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl -z-10 group-hover:opacity-100 transition-opacity duration-700 opacity-50" />

      {/* Başlık Alanı */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center p-[1px] shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <div className="w-full h-full bg-[#0B0B0B] rounded-[11px] flex items-center justify-center">
              <Sparkles size={18} className="text-pink-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">Hikaye Yönetimi</h2>
            <p className="text-xs text-gray-500 font-medium">{activeStories.length} aktif hikaye yayında (24s)</p>
          </div>
        </div>

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-white/[0.03] hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-pink-500/20 border border-white/[0.05] hover:border-pink-500/30 text-gray-300 hover:text-pink-300 px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 text-sm font-bold shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yeni Ekle</span>
          </button>
        )}
      </div>

      {/* Hikaye Ekleme Formu */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAdding ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
        <form onSubmit={handleSubmit} className="bg-black/20 border border-white/[0.04] p-5 rounded-2xl space-y-4 relative">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={12} /> Görsel URL
              </label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (Opsiyonel)" 
                className="w-full bg-white/[0.03] border border-white/[0.05] focus:border-pink-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon size={12} /> Kaydırma Linki (Swipe Up)
              </label>
              <input 
                type="text" 
                value={storyLink}
                onChange={(e) => setStoryLink(e.target.value)}
                placeholder="Örn: /post/123 (Opsiyonel)" 
                className="w-full bg-white/[0.03] border border-white/[0.05] focus:border-pink-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hikaye Metni</label>
            <textarea 
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Hikayede ne yazsın? (Max 150 karakter)" 
              maxLength={150}
              rows={2}
              className="w-full bg-white/[0.03] border border-white/[0.05] focus:border-pink-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all shadow-inner resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Vazgeç
            </button>
            <button 
              type="submit" 
              disabled={!storyText.trim() && !imageUrl.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            >
              Fırlat <Send size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Aktif Hikayeler Listesi */}
      <div className="border-t border-white/[0.04] pt-5">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Yayındaki Hikayeler</h3>
        
        {activeStories.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <p className="text-sm text-gray-500 font-medium">Şu an yayında olan bir hikaye yok.</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar snap-x">
            {activeStories.map((story) => (
              <div key={story.id} className="snap-start shrink-0 relative group/story cursor-pointer">
                {/* Hikaye Baloncuğu */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500 p-[2.5px] shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <div className="w-full h-full bg-[#0B0B0B] rounded-full overflow-hidden border-2 border-[#0B0B0B] flex items-center justify-center relative">
                    {story.img ? (
                      <img src={story.img} alt="story" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 text-center px-1 leading-tight line-clamp-3">
                        {story.text}
                      </span>
                    )}
                    
                    {/* Hover Silme Menüsü */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover/story:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <button 
                        onClick={() => handleDelete(story.id)}
                        className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                        title="Hikayeyi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* İstatistikler */}
                <div className="mt-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-[10px] font-bold">
                    <Eye size={10} /> {story.views}
                  </div>
                  <div className="text-[9px] text-gray-600 font-medium mt-0.5">
                    {story.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}