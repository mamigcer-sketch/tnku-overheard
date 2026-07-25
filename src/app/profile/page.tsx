"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VenetianMask, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { updateCustomNickname } from './actions';

export default function ProfilePage() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    const formData = new FormData();
    formData.append('nickname', nickname);

    const res = await updateCustomNickname(formData);

    if (res.error) {
      setStatus({ type: 'error', msg: res.error });
    } else if (res.success) {
      setStatus({ type: 'success', msg: 'Harika! Kullanıcı adın başarıyla güncellendi.' });
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative z-0 overflow-hidden flex flex-col items-center justify-center p-4">
      
      {/* Zemin Işıkları */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4DA3FF]/10 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-medium text-sm">
          <ArrowLeft size={16} /> Ana Sayfaya Dön
        </Link>

        <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-[24px] shadow-2xl relative overflow-hidden">
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mb-6 shadow-inner">
            <VenetianMask size={24} />
          </div>

          <h1 className="text-2xl font-black mb-2 tracking-tight">Sahne Adını Belirle</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Anonim kalmak istemiyorsan kendine özel bir nick seç. Tüm itiraflarında ve boş yapmalarında bu isimle tanınacaksın. (Örn: baddie, d6_mudavimi)
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="yeni_nickin"
                maxLength={15}
                required
                className="w-full bg-white/[0.03] border border-white/10 group-hover:border-white/20 focus:border-[#4DA3FF]/50 focus:ring-1 focus:ring-[#4DA3FF]/30 rounded-xl px-10 py-4 text-white outline-none transition-all shadow-inner"
              />
            </div>

            {status.type === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle size={16} /> {status.msg}
              </div>
            )}

            {status.type === 'success' && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-sm font-medium">
                <CheckCircle2 size={16} /> {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || status.type === 'success'}
              className="w-full bg-gradient-to-r from-[#4DA3FF] to-blue-500 hover:from-blue-400 hover:to-blue-600 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Kimliğimi Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}