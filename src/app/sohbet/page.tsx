"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendMessage } from "./actions";
import { Home, Send, User } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton"; // Kendi BackButton'unun yolu doğru değilse düzeltirsin

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string) => {
  if (!id) return { name: "Gizemli Yolcu" };
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return { name: `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}` };
};

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [myId, setMyId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Kendi yolladığımız mesajı sağda göstermek için tarayıcıdan ID okuyoruz
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const authorCookie = cookies.find(c => c.trim().startsWith('tnku_author_id='));
    if (authorCookie) setMyId(authorCookie.split('=')[1]);
  }, []);

  // Mesajlar her güncellendiğinde en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    // Önce eski mesajları (son 50 tane) getir
    const fetchInitialMessages = async () => {
      const { data } = await supabase
        .from('ChatMessage')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(50);
      
      if (data) setMessages(data.reverse());
    };
    fetchInitialMessages();

    // Supabase REALTIME - Yeni mesaj geldiği an ekrana bas!
    const channel = supabase
      .channel("realtime:chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ChatMessage" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const msg = inputValue;
    setInputValue(""); // İnputu hemen temizle, hissiyat hızlı olsun
    await sendMessage(msg); // Veritabanına gönder
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white flex flex-col h-screen">
      
      {/* Üst Header */}
      <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h1 className="text-lg font-extrabold tracking-tighter">GLOBAL <span className="text-[#4DA3FF]">LOBİ</span></h1>
          </Link>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link href="/" className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-full transition-colors text-[13px] font-medium border border-white/[0.05]">
              <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mesajların Aktığı Alan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full pb-32 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm font-medium">
            Lobide şu an kimse yok. İlk mesajı sen at! 🚀
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.authorUuid === myId;
          const author = getAnonymousData(msg.authorUuid);
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {!isMe && (
                <span className="text-[10px] text-gray-400 font-bold mb-1 ml-1 flex items-center gap-1">
                  <User size={10} /> {author.name}
                </span>
              )}
              <div 
                className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] break-words text-[14px] sm:text-[15px] font-medium shadow-sm ${
                  isMe 
                    ? 'bg-[#4DA3FF] text-white rounded-br-sm shadow-[#4DA3FF]/20' 
                    : 'bg-[#1A1A1A] text-gray-100 border border-white/5 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {/* En alta inmek için referans divi */}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Gönderme Kutusu */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B] border-t border-white/10 p-3 pb-6 sm:pb-3">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Lobiye bir şeyler fısılda..."
            maxLength={250}
            className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-full py-3.5 pl-5 pr-14 outline-none focus:border-[#4DA3FF]/50 focus:bg-[#202020] transition-all text-sm sm:text-base font-medium placeholder:text-gray-500"
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim()}
            className="absolute right-1.5 p-2.5 bg-[#4DA3FF] text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-[#4DA3FF] transition-colors"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>

    </main>
  );
}