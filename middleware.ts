import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 1. DOKUNULMAZ ALANLAR: Admin paneli, API'ler ve statik dosyalar şalterden asla etkilenmez!
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // 2. ŞALTER KONTROLÜ: API'ye "Sistem açık mı?" diye sor.
    // (Veritabanı çökmesin diye cevabı 2 saniye önbellekte tutuyoruz, ışık hızında çalışır)
    const res = await fetch(new URL('/api/system-status', request.url), {
      next: { revalidate: 2 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // 3. EĞER ŞALTER KAPALIYSA (BAKIM MODU): Ve kullanıcı bakım sayfasında değilse, oraya fırlat!
      if (data.isActive === false && url.pathname !== '/bakim') {
        return NextResponse.redirect(new URL('/bakim', request.url));
      }

      // 4. EĞER ŞALTER AÇIKSA: Ama kullanıcı eski bir linkten vs. bakım sayfasına girmişse, ana sayfaya at!
      if (data.isActive === true && url.pathname === '/bakim') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch (err) {
    console.error("Middleware şalter kontrol hatası:", err);
    // Eğer anlık bir API çökmesi olursa sistemi kitlememek için yola devam et
  }

  return NextResponse.next();
}

// Hangi yolların middleware'e gireceğini belirler (Görseller, ikonlar vb. hariç)
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};