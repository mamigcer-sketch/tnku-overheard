export default function PostSkeleton() {
  return (
    // 🔥 Ana PostCard ile birebir aynı kavis (rounded-[22px]), padding ve arka plan tonu
    <div className="relative group bg-[#151515]/80 backdrop-blur-lg border border-white/5 p-4 sm:p-5 rounded-[22px] overflow-hidden shadow-lg animate-pulse">
      
      {/* Üst Kısım: Kategori ve Yazar Alanı */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Kategori Etiketi */}
          <div className="w-16 h-5 bg-white/10 rounded-md" />
          {/* Yazar Bilgisi */}
          <div className="w-28 h-5 bg-white/5 rounded-md" />
        </div>
        {/* Tarih */}
        <div className="w-14 h-4 bg-white/5 rounded-md pt-1" />
      </div>

      {/* İçerik Metin Satırları */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-white/10 rounded-md" />
        <div className="w-5/6 h-4 bg-white/5 rounded-md" />
        <div className="w-2/3 h-4 bg-white/[0.03] rounded-md" />
      </div>

      {/* Alt Butonlar ve İkonlar Alanı */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-6 bg-white/5 rounded-xl" />
          <div className="w-10 h-6 bg-white/5 rounded-xl" />
          <div className="w-8 h-6 bg-white/[0.03] rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-white/[0.03] rounded-full" />
          <div className="w-8 h-8 bg-white/[0.03] rounded-full" />
        </div>
      </div>
    </div>
  );
}