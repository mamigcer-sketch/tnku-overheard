import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink, Sparkles, Flame } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const cookieStore = await cookies();
  let userUuid = cookieStore.get('user_uuid')?.value;

  const now = new Date();
  
  // Etkinlikleri getir (Sponsorlular her zaman en üstte!)
  const events = await prisma.event.findMany({
    where: { date: { gte: now } },
    orderBy: [
      { isSponsored: 'desc' },
      { date: 'asc' }
    ],
    include: {
      _count: { select: { attendees: true } },
      attendees: userUuid ? { where: { userUuid } } : false
    }
  });

  async function toggleAttendance(formData: FormData) {
    'use server';
    const eventId = formData.get('eventId') as string;
    const currentCookieStore = await cookies();
    const currentUser = currentCookieStore.get('user_uuid')?.value;
    
    if (!currentUser) return;

    const existing = await prisma.eventAttendee.findUnique({
      where: { eventId_userUuid: { eventId: eventId, userUuid: currentUser } }
    });

    if (existing) {
      await prisma.eventAttendee.delete({ where: { id: existing.id } });
    } else {
      await prisma.eventAttendee.create({
        data: { eventId: eventId, userUuid: currentUser }
      });
    }
    revalidatePath('/etkinlikler');
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white relative z-0 pb-20 selection:bg-[#4DA3FF]/30 transition-colors duration-300">
      
      <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-slate-50 to-slate-50 dark:from-amber-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none transition-colors duration-300"></div>
      </div>

      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/20 backdrop-blur-3xl border-b border-gray-200 dark:border-white/[0.05] shadow-sm px-4 py-3 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white transition-colors p-1.5 dark:bg-white/5 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[16px] font-black tracking-widest uppercase flex items-center gap-2">
            <Flame size={16} className="text-amber-500 animate-pulse" /> Kampüs Radarı
          </h1>
        </div>
        <MobileMenu userUuid={userUuid} />
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Yaklaşan Etkinlikler</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Partiler, turnuvalar ve sponsorlu buluşmalar.</p>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-[24px] border border-gray-200 dark:border-white/[0.05] flex flex-col items-center justify-center backdrop-blur-md">
              <Calendar size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-bold text-[14px]">Şu an ufukta bir etkinlik görünmüyor.</p>
            </div>
          ) : (
            events.map((event) => {
              const isGoing = event.attendees && event.attendees.length > 0;
              const attendeeCount = event._count.attendees;

              return (
                <div key={event.id} className={`relative overflow-hidden rounded-[24px] border transition-all duration-300 ${event.isSponsored ? 'bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-500/10 dark:to-[#0A0A0A] border-amber-300/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30' : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/[0.05] shadow-sm'}`}>
                  
                  {event.isSponsored && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl z-20 flex items-center gap-1 shadow-md">
                      <Sparkles size={10} /> Reklam
                    </div>
                  )}

                  {event.imageUrl && (
                    <div className="w-full h-48 bg-gray-100 dark:bg-white/5 relative">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className={`text-lg font-black leading-tight ${event.isSponsored ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                      {event.title}
                    </h3>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-2 font-medium leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 dark:text-gray-400">
                        <Calendar size={14} className={event.isSponsored ? 'text-amber-500' : 'text-[#4DA3FF]'} />
                        {event.date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 dark:text-gray-400">
                          <MapPin size={14} className={event.isSponsored ? 'text-amber-500' : 'text-red-400'} />
                          {event.location}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                      <form action={toggleAttendance}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <button type="submit" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${isGoing ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                          <Users size={16} /> {isGoing ? 'Gidiyorsun' : 'Katılacağım'} 
                          <span className="ml-1 opacity-70">({attendeeCount})</span>
                        </button>
                      </form>

                      {event.actionLink && (
                        <a href={event.actionLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold shadow-sm transition-all ${event.isSponsored ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:shadow-md' : 'bg-blue-50 text-blue-600 dark:bg-[#4DA3FF]/10 dark:text-[#4DA3FF] hover:bg-blue-100 dark:hover:bg-[#4DA3FF]/20'}`}>
                          {event.actionText || 'İncele'} <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}