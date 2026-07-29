"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendMessage, getChatData } from "./actions";
import { Home, Send, User, Info, ShieldAlert } from "lucide-react"; 
import Link from "next/link";
import BackButton from "@/components/BackButton"; 

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek"];

const getAnonymousData = (id: string) => {
  if (!id) return "Gizemli Yolcu";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`;
};

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  const [myId, setMyId] = useState("");
  const [nicknames, setNicknames] = useState<any>({});
  const [badges, setBadges] = useState<any>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getChatData();
      
      let finalId = data.userUuid;
      if (!finalId) {
        finalId = localStorage.getItem('tnku_chat_anon_id') || "";
        if (!finalId) {
          finalId = 'anon_' + Math.random().toString(36).substring(2);
          localStorage.setItem('tnku_chat_anon_id', finalId);
        }
      }
      
      setMyId(finalId);
      setNicknames(data.customNicknamesMap);
      setBadges(data.userBadgesMap);
      
      if (data.initialMessages) {
        setMessages(data.initialMessages);
      }
    };
    loadUserData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
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
    if (!inputValue.trim() || !myId) return;
    const msg = inputValue;
    setInputValue(""); 
    
    await sendMessage(msg, myId); 
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white flex flex-col h-screen relative selection:bg-[#4DA3FF]/30">
      
      {/* Hafif arka plan ışıltısı */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#4DA3FF]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sm:py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </div>
            <h1 className="text-lg font-black tracking-tighter">GLOBAL <span className="text-[#4DA3FF]">LOBİ</span></h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <BackButton />
            <Link href="/" className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-full transition-colors text-[13px] font-medium border border-white/[0.05]">
              <Home size={16} className="sm:mr-1.5" /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      {/* SOHBET AKIŞI BİLGİSİ */}
      <div className="w-full flex justify-center py-3 relative z-10">
        <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide shadow-sm">
          <ShieldAlert size={12} className="text-[#4DA3FF]" /> Sohbet akışını korumak için son 50 mesaj gösterilir
        </span>
      </div>

      {/* NİCK UYARISI */}
      {!nicknames[myId] && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2 relative z-10">
          <div className="bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 py-2.5 px-4 rounded-xl flex items-center justify-center text-[#4DA3FF] text-[11px] sm:text-xs font-bold gap-1.5 tracking-wide shadow-[0_0_15px_rgba(77,163,255,0.05)]">
            <Info size={14} />
            NİCKİNİ BELİRLE KISMINDAN NİCKİNİ AL!
          </div>
        </div>
      )}

      {/* MESAJLAR ALANI */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-3xl mx-auto w-full pb-36 custom-scrollbar relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm font-medium">
            Lobide şu an kimse yok. İlk mesajı sen at! 🚀
          </div>
        )}

        {messages.map((msg, index) => {
          const rawAuthorId = msg.authorUuid || msg.authoruuid || msg.author_uuid || "";
          const rawContent = msg.content || msg.message || msg.text || "";
          
          const isMe = rawAuthorId === myId;
          const displayName = nicknames[rawAuthorId] || getAnonymousData(rawAuthorId);
          const userBadge = badges[rawAuthorId];
          
          return (
            <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              
              {!isMe && (
                <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                  <div className="bg-white/5 border border-white/10 p-1 rounded-full flex items-center justify-center">
                    <User size={10} className="text-gray-400" /> 
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold">
                    {displayName}
                  </span>
                  {userBadge && (
                    <span className="bg-[#4DA3FF]/15 text-[#4DA3FF] border border-[#4DA3FF]/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-black">
                      {userBadge}
                    </span>
                  )}
                </div>
              )}

              <div 
                className={`px-4 py-2.5 max-w-[85%] sm:max-w-[75%] break-words text-[14.5px] sm:text-[15px] leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-tr from-[#2563EB] to-[#4DA3FF] text-white rounded-[20px] rounded-tr-[4px] shadow-blue-500/20 font-medium' 
                    : 'bg-[#1E1E24] text-gray-100 border border-white/5 rounded-[20px] rounded-tl-[4px] font-normal'
                }`}
              >
                {rawContent ? rawContent : JSON.stringify(msg)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* YÜZEN INPUT ALANI */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/95 to-transparent pt-12 pb-6 px-4 z-50 pointer-events-none">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center pointer-events-auto">
          <div className="w-full bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all focus-within:border-[#4DA3FF]/50 focus-within:bg-[#202020]/90">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Lobiye bir şeyler fısılda..."
              maxLength={250}
              className="flex-1 bg-transparent text-white py-3 pl-5 pr-4 outline-none text-sm sm:text-[15px] placeholder:text-gray-500"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-3 mr-1 bg-gradient-to-r from-[#4DA3FF] to-blue-600 text-white rounded-full hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:grayscale transition-all shadow-lg shadow-blue-500/25 shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </form>
      </div>

    </main>
  );
}