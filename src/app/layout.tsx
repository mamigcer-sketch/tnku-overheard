import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop'; // 🔥 YENİ BUTON BİLEŞENİ EKLENDİ

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
        
        {/* 🔥 YUKARI ÇIK BUTONU: Tüm sayfalarda en altta, sağda duracak! */}
        <ScrollToTop />
      </body>
    </html>
  );
}