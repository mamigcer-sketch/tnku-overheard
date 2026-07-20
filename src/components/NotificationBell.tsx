"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { markNotificationsAsRead } from '@/app/post/actions';

export default function NotificationBell({ notifications }: { notifications: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  // Tıklanınca menü kapansın diye event listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && localUnreadCount > 0) {
      setLocalUnreadCount(0); // Anında rozeti sil (UX için)
      await markNotificationsAsRead(); // Veritabanında okundu yap
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown} 
        className="relative flex items-center justify-center p-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-full border border-white/[0.05] transition-colors active:scale-95"
      >
        <Bell size={18} className="text-gray-300" />
        {localUnreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-[2px] border-[#0B0B0B] animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Bildirimler 
              {localUnreadCount > 0 && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full">{localUnreadCount} Yeni</span>}
            </h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs font-medium text-gray-500">
                Şu anlık ortalık sakin. <br/> Henüz bir bildirim yok.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link 
                  href={`/post/${notif.postId}`} 
                  key={notif.id} 
                  onClick={() => setIsOpen(false)} 
                  className={`block p-4 border-b border-white/5 hover:bg-white/[0.06] transition-colors ${!notif.isRead ? 'bg-[#4DA3FF]/5' : ''}`}
                >
                  <p className={`text-[13px] leading-relaxed ${!notif.isRead ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-gray-500 mt-2 block font-medium">
                    {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}