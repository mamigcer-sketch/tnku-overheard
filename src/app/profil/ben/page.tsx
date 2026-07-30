import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyProfileRedirectPage() {
  const cookieStore = await cookies();
  const realAuthorId = cookieStore.get('tnku_author_id')?.value;

  if (!realAuthorId) {
    // Eğer çerez yoksa ana sayfaya at
    redirect('/');
  }

  // Gerçek profil sayfana yönlendiriyoruz
  redirect(`/profil/${encodeURIComponent(realAuthorId)}`);
}