import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ScrollToTopV2 from '@/components/ScrollToTopV2';
import InstallModal from '@/components/InstallModal';
import SyncAuth from '@/components/SyncAuth'; // 🔥 Instagram kimlik sabitleme bileşeni eklendi
import SplashScreen from '@/components/SplashScreen'; // 🔥 EFSANE AÇILIŞ EKRANI EKLENDİ

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TNKU Overheard | NKÜ - NKÜ İtiraf',
  description: 'Tekirdağ Namık Kemal Üniversitesi (NKÜ) öğrencilerine özel itiraf, dedikodu ve kampüs platformu. Kampüste olan biteni anonim fısılda!',
  keywords: [
    'NKÜ', 
    'nkü', 
    'Namık Kemal Üniversitesi', 
    'namık kemal itiraf', 
    'nkü itiraf', 
    'TNKU', 
    'tnku overheard', 
    'Değirmenaltı', 
    'Tekirdağ', 
    'nkü kampüs', 
    'nkü dedikodu',
    'nkü obs',
    'tnkuoverheard'
  ],
  icons: {
    icon: '/icon.jpg', 
  },
  openGraph: {
    title: 'TNKU Overheard | NKÜ İtiraf ve Dedikodu',
    description: 'Namık Kemal Üniversitesi (NKÜ) itiraf ve dedikodu platformu.',
    url: 'https://www.tnkuoverheard.com.tr',
    siteName: 'TNKU Overheard',
    locale: 'tr_TR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.tnkuoverheard.com.tr',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        
        {/* 🔥 ŞELALE GİBİ AKACAK İNTRO EKRANI */}
        <SplashScreen />

        {children}
        
        {/* 🔥 YUKARI ÇIK BUTONU */}
        <ScrollToTopV2 />

        {/* 🔥 UYGULAMAYI YÜKLE MODALI */}
        <InstallModal />

        {/* 🔥 İNSTAGRAM TARAYICI KİMLİK SABİTLEME KÖPRÜSÜ */}
        <SyncAuth />
      </body>
    </html>
  );
}