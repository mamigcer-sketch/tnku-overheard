import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const maintenanceMode = false; // 🔥 Bakım modu aktif! İşin bitince false yaparsın.

  if (!maintenanceMode) {
    return NextResponse.next();
  }

  // Admin paneli ve sistem dosyaları etkilenmez
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Diğer herkesi bakım sayfasına yönlendir
  if (url.pathname !== '/bakim') {
    return NextResponse.redirect(new URL('/bakim', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};