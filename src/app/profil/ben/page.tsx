import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyProfileRedirectPage() {
  const cookieStore = await cookies();
  
  // 🔥 Hem tnku_author_id'yi hem de genel user_uuid'yi kontrol ediyoruz
  const realAuthorId = cookieStore.get('tnku_author_id')?.value;
  const generalUserUuid = cookieStore.get('user_uuid')?.value;

  // Hangisi varsa öncelikli olarak onu kullanıyoruz ki profil boş kalmasın
  const targetId = realAuthorId || generalUserUuid;

  if (!targetId) {
    redirect('/');
  }

  // Gerçek profil sayfana kusursuz yönlendirme
  redirect(`/profil/${encodeURIComponent(targetId)}`);
}