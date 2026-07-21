"use client";

import { Camera } from "lucide-react";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousName = (id: string) => {
  if (!id) return "Gizemli Yolcu";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`;
};

export default function StoryButton({ postContent, postType, postId, authorUuid }: { postContent: string, postType: string, postId: string, authorUuid?: string }) {
  const authorName = getAnonymousName(authorUuid || postId);

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Arka Plan (Koyu Tema)
    ctx.fillStyle = '#0B0B0B';
    ctx.fillRect(0, 0, 1080, 1920);

    // Üst sol ve alt sağ Işık Efektleri (Glow)
    const grad1 = ctx.createRadialGradient(200, 300, 0, 200, 300, 600);
    grad1.addColorStop(0, 'rgba(77, 163, 255, 0.25)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, 1080, 1920);

    const grad2 = ctx.createRadialGradient(880, 1600, 0, 880, 1600, 700);
    grad2.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Ortadaki Cam Efektli Kart Kutusu
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(90, 420, 900, 1040, 40);
    ctx.fill();
    ctx.stroke();

    // 3. Başlık / Marka
    ctx.fillStyle = '#4DA3FF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('TNKU OVERHEARD', 140, 520);

    // Dinamik Kullanıcı Adı (Örn: @Sarhoş Kurt)
    ctx.fillStyle = '#888888';
    ctx.font = '28px sans-serif';
    ctx.fillText(`@${authorName}`, 140, 570);

    // Kategori Rozeti
    const isConfession = postType === 'CONFESSION';
    ctx.fillStyle = isConfession ? 'rgba(168, 85, 247, 0.2)' : 'rgba(77, 163, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(740, 490, 210, 50, 16);
    ctx.fill();
    ctx.fillStyle = isConfession ? '#c084fc' : '#4DA3FF';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(isConfession ? 'İTİRAF' : 'OVERHEARD', 775, 525);

    // 4. Post Metni (Otomatik Satır Sarma / Word Wrap)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '44px sans-serif';
    const words = postContent.split(' ');
    let line = '';
    let y = 700;
    const maxWidth = 780;
    const lineHeight = 65;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 140, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 140, y);

    // 5. 🔥 Siteyi Öne Çıkaran Alt Yönlendirme Alanı (Footer)
    ctx.fillStyle = 'rgba(77, 163, 255, 0.12)';
    ctx.strokeStyle = 'rgba(77, 163, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(140, 1530, 800, 140, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4DA3FF';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DAHA FAZLASI VE İTİRAFLAR İÇİN', 540, 1585);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('www.tnkuoverheard.com.tr', 540, 1635);

    // Görseli İndir
    const link = document.createElement('a');
    link.download = `tnku-story-${postId.slice(0, 6)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <button 
      onClick={handleDownload}
      type="button"
      className="bg-purple-500/10 text-purple-400 py-2.5 px-4 rounded-xl text-xs font-bold border border-purple-500/20 hover:bg-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
    >
      <Camera size={14} /> Story Kartı 📸
    </button>
  );
}