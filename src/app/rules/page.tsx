import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function RulesPage() {
  const rules = [
    "Hakaret, aşağılama ve nefret söylemi kesinlikle yasaktır.",
    "Kişisel verilerin ifşası (doxxing) ban sebebidir.",
    "Spam ve reklam içerikli paylaşımlar onaylanmaz.",
    "Üniversite disiplin kurallarına aykırı içerik paylaşma.",
    "Anonimlik bir zırh değildir; etik kurallara her zaman uy."
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white p-4">
      <div className="max-w-2xl mx-auto pt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Geri Dön
        </Link>

        <div className="bg-[#121212] border border-white/10 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6 text-[#4DA3FF]">
            <ShieldCheck size={32} />
            <h1 className="text-2xl font-bold text-white">Topluluk Kuralları</h1>
          </div>
          
          <ul className="space-y-4">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <span className="text-[#4DA3FF] font-bold mt-1">•</span> {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}