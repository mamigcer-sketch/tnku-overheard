export default function PostSkeleton() {
  return (
    <div className="relative group backdrop-blur-2xl border bg-white/[0.01] border-white/[0.05] p-5 sm:p-6 rounded-[24px] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] animate-pulse">
      
      {/* Üst Kısım: Kategori ve Yazar Alanı */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex gap-2 items-center">
          {/* Kategori Etiketi */}
          <div className="w-20 h-6 bg-white/[0.06] rounded-md" />
          {/* Yazar Bilgisi */}
          <div className="w-32 h-6 bg-white/[0.04] rounded-lg" />
        </div>
        {/* Tarih */}
        <div className="w-16 h-4 bg-white/[0.03] rounded-md" />
      </div>

      {/* İçerik Metin Satırları */}
      <div className="space-y-2.5 mb-6">
        <div className="w-full h-4 bg-white/[0.05] rounded-md" />
        <div className="w-5/6 h-4 bg-white/[0.04] rounded-md" />
        <div className="w-3/4 h-4 bg-white/[0.03] rounded-md" />
      </div>

      {/* Alt Butonlar ve İkonlar Alanı */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
        <div className="flex items-center gap-6">
          <div className="w-12 h-6 bg-white/[0.04] rounded-xl" />
          <div className="w-10 h-6 bg-white/[0.04] rounded-xl" />
          <div className="w-10 h-6 bg-white/[0.03] rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-white/[0.03] rounded-full" />
          <div className="w-9 h-9 bg-white/[0.03] rounded-full" />
        </div>
      </div>
    </div>
  );
}