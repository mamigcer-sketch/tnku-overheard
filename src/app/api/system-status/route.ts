import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await (prisma as any).systemSetting.findUnique({ 
      where: { id: "global" } 
    });
    
    // Eğer ayar bulunamazsa (ilk kurulumda) siteyi açık varsay (true)
    const isSystemActive = setting ? setting.isActive : true;

    return NextResponse.json({ isActive: isSystemActive });
  } catch (error) {
    console.error("Şalter kontrol API hatası:", error);
    // Hata durumunda siteyi kapatmak yerine açık tutalım
    return NextResponse.json({ isActive: true });
  }
}