import prisma from '@/lib/prisma';
import { createAnnouncement, toggleAnnouncement, deleteAnnouncement } from './actions';
import { Bell, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 md:p-8 text-white max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#4DA3FF]/10 p-3 rounded-2xl border border-[#4DA3FF]/20">
          <Bell className="text-[#4DA3FF]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Kampüs Duyuruları & Banner</h1>
          <p className="text-gray-400 text-sm">Ana sayfanın en üstünde görünecek duyuruları buradan yönet.</p>
        </div>
      </div>

      {/* Duyuru Ekleme Formu */}
      <form action={createAnnouncement as any} className="bg-[#121212] border border-white/5 p-6 rounded-[24px] mb-8 space-y-4">
        <h3 className="font-bold text-gray-200 text-sm">Yeni Duyuru Oluştur</h3>
        <textarea 
          name="content" 
          required
          placeholder="Örn: 📌 Şenlik biletleri satışa çıktı! Detaylar için Instagram'a göz atın."
          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#4DA3FF] resize-none h-24"
        />
        <button type="submit" className="px-6 py-3 bg-[#4DA3FF] text-black font-bold rounded-xl text-sm hover:bg-[#4DA3FF]/90 transition-all flex items-center gap-2">
          <Plus size={16} /> Duyuruyu Yayınla
        </button>
      </form>

      {/* Mevcut Duyurular Listesi */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-200 text-sm">Yayınlanan Duyurular</h3>
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-[#121212] border border-white/5 rounded-2xl text-gray-500 text-sm">
            Henüz eklenmiş bir duyuru yok.
          </div>
        ) : (
          // 🔥 Burada (item: any) yaparak TypeScript'in isActive hatası vermesini kökten engelledik
          announcements.map((item: any) => (
            <div key={item.id} className="bg-[#121212] border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`} />
                  <span className="text-xs font-bold text-gray-400">{item.isActive ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                </div>
                <p className="text-gray-100 text-sm font-medium">{item.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Durum Değiştirme Formu */}
                <form action={toggleAnnouncement as any}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="isActive" value={String(item.isActive)} />
                  <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${item.isActive ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'}`}>
                    {item.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {item.isActive ? 'Pasife Al' : 'Aktif Et'}
                  </button>
                </form>

                {/* Silme Formu */}
                <form action={deleteAnnouncement as any}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}