import PostSkeleton from '@/components/PostSkeleton';

export default function Loading() {
  return (
    // 🔥 EN DIŞ KUTUYA GÜNDÜZ/GECE ARKA PLAN RENGİ EKLENDİ
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      
      {/* 🔥 ARKA PLAN PARLAMASI */}
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 dark:from-purple-900/30 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
      </div>

      {/* Yukarıdaki header alanının boşluğu */}
      <div className="h-[120px] w-full bg-transparent"></div>

      <div className="max-w-2xl mx-auto px-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </main>
  );
}