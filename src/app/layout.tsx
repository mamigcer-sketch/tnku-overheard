import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ScrollToTopV2 from '@/components/ScrollToTopV2';
import InstallModal from '@/components/InstallModal';
import SyncAuth from '@/components/SyncAuth'; 
import SplashScreen from '@/components/SplashScreen'; 
import { Providers } from './providers'; 

const inter = Inter({ subsets: ['latin'] });

// 🔥 İŞTE SİYAH ŞERİDİ YOK EDEN KOD (Apple Safari için tam ekran ve tema rengi uyumu) 🔥
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' }, 
    { media: '(prefers-color-scheme: dark)', color: '#050505' }
  ],
};

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
    <html lang="tr" suppressHydrationWarning>
      <body className={`bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-300 antialiased ${inter.className}`}>
        
        <Providers>
          <SplashScreen />

          <div className="pb-24 sm:pb-0">
            {children}
          </div>
          
          <ScrollToTopV2 />
          <InstallModal />
          <SyncAuth />
        </Providers>

      </body>
    </html>
  );
}