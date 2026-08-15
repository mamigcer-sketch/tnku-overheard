export default function PostSkeleton() {
  return (
    // 🔥 Ana PostCard ile birebir uyumlu, Gündüz/Gece temalı iskelet
    <div className="relative group bg-white dark:bg-[#151515]/80 backdrop-blur-lg border border-gray-200 dark:border-white/5 p-4 sm:p-5 rounded-[22px] overflow-hidden shadow-sm dark:shadow-lg animate-pulse transition-colors duration-300">
      
      {/* Üst Kısım: Kategori ve Yazar Alanı */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Kategori Etiketi */}
          <div className="w-16 h-5 bg-gray-200 dark:bg-white/10 rounded-md transition-colors" />
          {/* Yazar Bilgisi */}
          <div className="w-28 h-5 bg-gray-100 dark:bg-white/5 rounded-md transition-colors" />
        </div>
        {/* Tarih */}
        <div className="w-14 h-4 bg-gray-100 dark:bg-white/5 rounded-md pt-1 transition-colors" />
      </div>

      {/* İçerik Metin Satırları */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors" />
        <div className="w-5/6 h-4 bg-gray-100 dark:bg-white/5 rounded-md transition-colors" />
        <div className="w-2/3 h-4 bg-gray-50 dark:bg-white/[0.03] rounded-md transition-colors" />
      </div>

      {/* Alt Butonlar ve İkonlar Alanı */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-6 bg-gray-100 dark:bg-white/5 rounded-xl transition-colors" />
          <div className="w-10 h-6 bg-gray-100 dark:bg-white/5 rounded-xl transition-colors" />
          <div className="w-8 h-6 bg-gray-50 dark:bg-white/[0.03] rounded-xl transition-colors" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-50 dark:bg-white/[0.03] rounded-full transition-colors" />
          <div className="w-8 h-8 bg-gray-50 dark:bg-white/[0.03] rounded-full transition-colors" />
        </div>
      </div>
    </div>
  );
}