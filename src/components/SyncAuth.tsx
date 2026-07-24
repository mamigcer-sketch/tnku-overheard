"use client";

import { useEffect } from 'react';

export default function SyncAuth() {
  useEffect(() => {
    try {
      const STORAGE_KEY = 'tnku_persistent_author_id';
      let storedId = localStorage.getItem(STORAGE_KEY);

      // Çerezlerde var mı diye bak
      const match = document.cookie.match(new RegExp('(^| )tnku_author_id=([^;]+)'));
      const cookieId = match ? match[2] : null;

      if (!storedId && cookieId) {
        // Cookie'de var ama localStorage'da yoksa localStorage'a kaydet
        localStorage.setItem(STORAGE_KEY, cookieId);
      } else if (storedId && (!cookieId || cookieId !== storedId)) {
        // localStorage'da var ama cookie silindiyse veya değiştiyse cookie'ye geri çivile
        document.cookie = `tnku_author_id=${storedId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }
    } catch (e) {
      console.error("Auth sync hatası:", e);
    }
  }, []);

  return null;
}