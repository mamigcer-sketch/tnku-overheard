"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendMessage, getChatData } from "./actions";
import { Home, Send, User, Info, ShieldAlert, CheckCircle2, BookOpen, X } from "lucide-react"; 
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
  
  // 🔥 Kurallar Pop-up State'i (İlk girişte direkt açık gelir)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(true);

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
    <main className="h-[100dvh] bg-[#0B0B0B] text-white flex flex-col relative selection:bg-[#4DA3FF]/30 overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#4DA3FF]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <header className="shrink-0 relative z-50 bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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

      <div className="shrink-0 w-full flex flex-col items-center gap-2 pt-3 px-4 relative z-10 max-w-3xl mx-auto">
        <span className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 text-gray-400 px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide shadow-sm text-center">
          <ShieldAlert size={12} className="text-[#4DA3FF] shrink-0" /> Sohbet akışını korumak için son 50 mesaj gösterilir
        </span>

        {!nicknames[myId] && (
          <div className="bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 py-2 px-4 rounded-xl flex items-center justify-center text-[#4DA3FF] text-[11px] sm:text-xs font-bold gap-1.5 tracking-wide shadow-[0_0_15px_rgba(77,163,255,0.05)] w-full text-center">
            <Info size={14} className="shrink-0" />
            NİCKİNİ BELİRLE KISMINDAN NİCKİNİ AL!
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-3xl mx-auto w-full custom-scrollbar relative z-10">
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
                <Link 
                  href={`/profil/${encodeURIComponent(rawAuthorId)}`}
                  className="flex items-center gap-1.5 mb-1.5 ml-1 group w-fit cursor-pointer"
                >
                  <div className="bg-white/5 border border-white/10 p-1 rounded-full flex items-center justify-center group-hover:bg-white/10 group-hover:border-[#4DA3FF]/30 transition-all duration-300">
                    <User size={10} className="text-gray-400 group-hover:text-[#4DA3FF] transition-colors" /> 
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold group-hover:text-gray-200 transition-colors">
                    {displayName}
                  </span>
                  {userBadge && (
                    <span className="bg-[#4DA3FF]/15 text-[#4DA3FF] border border-[#4DA3FF]/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-black group-hover:bg-[#4DA3FF]/25 transition-colors">
                      {userBadge}
                    </span>
                  )}
                </Link>
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

      <div className="shrink-0 w-full bg-[#0B0B0B]/95 backdrop-blur-xl border-t border-white/5 pt-3 pb-4 sm:pb-6 px-3 sm:px-4 relative z-50">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center w-full">
          <div className="w-full bg-[#1A1A1A]/80 border border-white/10 rounded-full flex items-center p-1 shadow-[0_5px_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-[#4DA3FF]/50 focus-within:bg-[#202020]/90">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Lobiye bir şeyler fısılda..."
              maxLength={250}
              className="flex-1 bg-transparent text-white py-2.5 pl-4 pr-3 outline-none text-[16px] placeholder:text-gray-500"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-2.5 mr-0.5 bg-gradient-to-r from-[#4DA3FF] to-blue-600 text-white rounded-full hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:grayscale transition-all shadow-lg shrink-0"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>
        </form>
      </div>

      {/* 🔥 EKRANIN TAM ORTASINDA ÇIKAN KURALLAR POP-UP'I */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md bg-[#121212]/95 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapatma Çarpısı */}
            <button 
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* İkon */}
            <div className="w-12 h-12 rounded-2xl bg-[#4DA3FF]/10 border border-[#4DA3FF]/20 text-[#4DA3FF] flex items-center justify-center mb-5 shadow-inner">
              <BookOpen size={24} />
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight text-white">Global Lobi Kuralları</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
              TNKU Lobi ortamının huzurunu ve neşesini korumak için uyman gereken temel kurallar aşağıdadır:
            </p>

            <div className="space-y-3 mb-8 text-left text-xs sm:text-sm text-gray-300">
              <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span className="text-[#4DA3FF] font-bold">01.</span>
                <p>Küfür, hakaret, nefret söylemi ve kişisel hedef gösterme kesinlikle yasaktır.</p>
              </div>
              <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span className="text-[#4DA3FF] font-bold">02.</span>
                <p>Spam yapmak, aynı mesajı sürekli göndermek veya sohbet akışını bozmak engellenme sebebidir.</p>
              </div>
              <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span className="text-[#4DA3FF] font-bold">03.</span>
                <p>Kişisel gizliliğe saygı duyulmalı, kimsenin özel bilgileri paylaşılmamalıdır.</p>
              </div>
            </div>

            <button
              onClick={() => setIsRulesModalOpen(false)}
              className="w-full bg-gradient-to-r from-[#4DA3FF] to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] flex items-center justify-center gap-2 active:scale-95 text-sm cursor-pointer"
            >
              <CheckCircle2 size={18} /> Kuralları Okudum, Anladım
            </button>
          </div>
        </div>
      )}

    </main>
  );
}