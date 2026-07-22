import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ScrollToTopV2 from '@/components/ScrollToTopV2';
import InstallModal from '@/components/InstallModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TNKU Overheard',
  description: 'Namık Kemal Üniversitesi - Kampüste olan biteni anonim fısılda.',
  icons: {
    icon: '/icon.jpg', 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        
        {/* 🔥 YUKARI ÇIK BUTONU: Tüm sayfalarda sol altta gizli, kaydırınca belirecek! */}
        <ScrollToTopV2 />

        {/* 🔥 UYGULAMAYI YÜKLE MODALI: Tüm sayfalarda gizlice bekler, menüden tıklanınca fırlar! */}
        <InstallModal />
      </body>
    </html>
  );
}