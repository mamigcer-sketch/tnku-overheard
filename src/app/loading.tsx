import PostSkeleton from "@/components/PostSkeleton";

// Next.js, page.tsx içindeki await prisma... işlemleri bitene kadar 
// otomatik olarak bu sayfayı gösterecek.
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-24">
      {/* Üstteki header boşluğu veya kendi navbar'ını buraya koyabilirsin */}
      <div className="h-20" /> 
      
      <div className="max-w-2xl mx-auto px-4 space-y-6 relative z-10">
        {/* Ekranda alt alta 3 tane iskelet post gösterelim */}
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}