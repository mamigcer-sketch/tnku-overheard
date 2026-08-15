export default function PostSkeleton() {
  return (
    // 🔥 Ana PostCard ile birebir aynı kavis (rounded-[24px]), padding ve Gündüz/Gece uyumu
    <div className="relative group w-full bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[24px] mb-5 p-4 sm:p-5 border border-gray-200 dark:border-white/[0.04] shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] animate-pulse transition-colors duration-300">
      
      {/* Üst Kısım: Avatar, Yazar ve Etiket Alanı */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 shrink-0 rounded-full bg-gray-200 dark:bg-white/10 transition-colors duration-300" />
          
          <div className="flex flex-col gap-1.5">
            {/* İsim */}
            <div className="w-28 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
            {/* Tarih */}
            <div className="w-20 h-3 bg-gray-100 dark:bg-white/5 rounded-md transition-colors duration-300" />
          </div>
        </div>
        
        {/* Kategori Etiketi */}
        <div className="w-14 h-6 bg-gray-100 dark:bg-white/5 rounded-lg transition-colors duration-300" />
      </div>

      {/* İçerik Metin Satırları */}
      <div className="space-y-2.5 mb-5 relative z-10 pl-1">
        <div className="w-full h-3.5 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
        <div className="w-5/6 h-3.5 bg-gray-100 dark:bg-white/5 rounded-md transition-colors duration-300" />
        <div className="w-2/3 h-3.5 bg-gray-50 dark:bg-white/[0.03] rounded-md transition-colors duration-300" />
      </div>

      {/* Alt Butonlar Alanı */}
      <div className="mt-5 flex items-center justify-between bg-gray-50 dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.1] rounded-full px-4 py-3 shadow-inner dark:shadow-none transition-colors duration-300">
        <div className="flex items-center gap-5">
          <div className="w-8 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
          <div className="w-8 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
          <div className="w-8 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
        </div>
        <div className="flex gap-4">
          <div className="w-6 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
          <div className="w-6 h-4 bg-gray-200 dark:bg-white/10 rounded-md transition-colors duration-300" />
        </div>
      </div>
      
    </div>
  );
}