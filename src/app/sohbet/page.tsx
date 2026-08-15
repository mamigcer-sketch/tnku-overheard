"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sendMessage, getChatData } from "./actions";
import { Home, Send, ShieldAlert, CheckCircle2, BookOpen, X, Sparkles } from "lucide-react"; 
import Link from "next/link";

const adjectives = ["Delirmiş", "Uykusuz", "Borçlu", "İşsiz", "Paranoyak", "Şizo", "Yorgun", "Düşünceli", "Tripli", "Sarhoş", "Kafacı", "Perişan", "Bunalımlı", "Huysuz", "Şaşkın", "Zavallı", "Cin", "Depresif", "Tuzlu", "Avare", "Deli", "Çılgın", "Bıkkın", "Dalgın", "Ters", "Şüpheli", "Kuşkulu", "Durgun", "Hızlı", "Yavaş", "Donuk", "Parlak", "Sinsi", "Kurnaz", "Tatlı", "Sert", "Yabani", "Yalnız", "Suskun", "Coşkulu"];
const animals = ["Kedi", "Köpek", "Panda", "Rakun", "Baykuş", "Hamster", "Martı", "Porsuk", "Salyangoz", "Pelikan", "Flamingo", "Kunduz", "Yarasa", "Deve", "Ördek", "Tavuk", "Maymun", "Keçi", "Sincap", "Kurbağa", "Kaplan", "Koala", "Tilki", "Kurt", "Aslan", "Şahin", "Karga", "Köstebek", "Koyun", "İnek", "At", "Eşek", "Fok", "Penguen", "Kirpi", "Sazan", "Yengeç", "Ahtapot", "Kertenkele", "Koala"];

const getAnonymousData = (id: string) => {
  if (!id) return "Gizemli Yolcu";
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const positiveHash = Math.abs(hash);
  return `${adjectives[positiveHash % adjectives.length]} ${animals[Math.floor(positiveHash / adjectives.length) % animals.length]}`;
};

const formatMessageTime = (dateInput: string | Date) => {
  if (!dateInput) return "";
  let safeDate = dateInput;
  if (typeof safeDate === 'string' && !safeDate.endsWith('Z') && !safeDate.includes('+')) {
    safeDate += 'Z';
  }
  const date = new Date(safeDate);
  const now = new Date();

  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) return `Bugün ${timeStr}`;
  if (isYesterday) return `Dün ${timeStr}`;

  return `${date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} ${timeStr}`;
};

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const [myId, setMyId] = useState("");
  const [nicknames, setNicknames] = useState<any>({});
  const [badges, setBadges] = useState<any>({});
  const [avatars, setAvatars] = useState<any>({}); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rulesAccepted = localStorage.getItem('tnku_chat_rules_accepted');
    if (!rulesAccepted) {
      setIsRulesModalOpen(true);
    }

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
      setNicknames(data.customNicknamesMap || {});
      setBadges(data.userBadgesMap || {});
      setAvatars(data.userAvatarsMap || {}); 
      
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

  const acceptRules = () => {
    localStorage.setItem('tnku_chat_rules_accepted', 'true');
    setIsRulesModalOpen(false);
  };

  return (
    <main className="fixed inset-0 w-full h-full bg-slate-50 dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col justify-between overflow-hidden selection:bg-[#4DA3FF]/30 transition-colors duration-300">
      
      {/* ARKA PLAN EFEKTİ DİNAMİK */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200/50 via-slate-50 to-transparent dark:from-blue-900/20 dark:via-[#050505] pointer-events-none z-0 transition-colors duration-300"></div>

      {/* HEADER */}
      <header className="shrink-0 relative z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl border-b border-gray-200 dark:border-white/[0.05] px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-widest uppercase text-gray-900 dark:text-white">GLOBAL <span className="text-[#4DA3FF]">LOBİ</span></h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/[0.03] hover:bg-gray-200 dark:hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full transition-colors text-[12px] sm:text-[13px] font-bold border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-gray-300">
              <Home size={14} /> <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MESAJLAR AKIŞI */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-6 space-y-1 max-w-4xl mx-auto w-full relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {!nicknames[myId] && (
          <div className="bg-gradient-to-r from-blue-50 dark:from-[#4DA3FF]/10 to-transparent border-l-2 border-[#4DA3FF] p-3 rounded-r-2xl flex items-center justify-between text-gray-800 dark:text-white text-xs font-semibold gap-3 mb-6 shadow-sm mx-2 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#4DA3FF] shrink-0" />
              <span className="opacity-90">Sıradan görünüyorsun. Lobiye havalı bir giriş yapmak ister misin?</span>
            </div>
            <Link href="/profil/ben" className="bg-blue-100 hover:bg-blue-200 dark:bg-[#4DA3FF]/20 dark:hover:bg-[#4DA3FF] dark:hover:text-black text-blue-700 dark:text-[#4DA3FF] border border-blue-200 dark:border-[#4DA3FF]/30 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all shrink-0 cursor-pointer">
              Profiline Git
            </Link>
          </div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm font-medium">
            Lobide şu an kimse yok. İlk mesajı sen at! 🚀
          </div>
        )}

        {messages.map((msg, index) => {
          const rawAuthorId = msg.authorUuid || msg.authoruuid || msg.author_uuid || "";
          const rawContent = msg.content || msg.message || msg.text || "";
          const rawTimestamp = msg.createdAt || msg.created_at || new Date(); 
          
          const isMe = rawAuthorId === myId;
          const displayName = nicknames[rawAuthorId] || getAnonymousData(rawAuthorId);
          const userBadge = badges[rawAuthorId];
          const currentAvatar = avatars[rawAuthorId]; 

          const prevMsg = index > 0 ? messages[index - 1] : null;
          const prevAuthorId = prevMsg ? (prevMsg.authorUuid || prevMsg.authoruuid || prevMsg.author_uuid || "") : null;
          const isSameAuthor = prevAuthorId === rawAuthorId;
          
          return (
            <div key={msg.id || index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isSameAuthor ? 'mt-1' : 'mt-4'}`}>
              
              <div className={`flex gap-2.5 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* SOL TARAF: AVATAR */}
                {!isMe && (
                  <div className="w-8 sm:w-9 shrink-0 flex flex-col justify-end pb-1">
                    {!isSameAuthor ? (
                      <Link href={`/profil/${encodeURIComponent(rawAuthorId)}`} className="block w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 dark:bg-[#1A1A1A] border border-gray-300 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-inner hover:scale-105 transition-all">
                        {currentAvatar?.startsWith("data:image") ? (
                          <img src={currentAvatar} alt="Profil" className="w-full h-full object-cover" />
                        ) : currentAvatar ? (
                          <span className="text-lg">{currentAvatar}</span>
                        ) : (
                          <span className="font-black text-xs opacity-80 text-gray-500 dark:text-white">{displayName.charAt(0)}</span>
                        )}
                      </Link>
                    ) : (
                      <div className="w-8 sm:w-9" /> 
                    )}
                  </div>
                )}

                {/* SAĞ TARAF: MESAJ İÇERİĞİ */}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* İsim ve Rozet */}
                  {!isSameAuthor && !isMe && (
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                      <Link href={`/profil/${encodeURIComponent(rawAuthorId)}`} className="text-[11px] text-gray-500 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors">
                        {displayName}
                      </Link>
                      {userBadge && (
                        <span className="bg-amber-100 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest font-black transition-colors duration-300">
                          {userBadge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mesaj Baloncuğu */}
                  <div 
                    className={`px-4 py-2.5 shadow-sm relative group flex flex-col transition-colors duration-300 ${
                      isMe 
                        ? `bg-gradient-to-tr from-[#0057FF] to-[#4DA3FF] text-white shadow-[0_4px_15px_rgba(77,163,255,0.2)] ${
                            isSameAuthor ? 'rounded-[20px] rounded-tr-[4px]' : 'rounded-[20px] rounded-tr-[4px] rounded-br-[4px]'
                          }` 
                        : `bg-white border-gray-200 text-gray-800 dark:bg-white/[0.04] dark:backdrop-blur-xl dark:border-white/[0.05] dark:text-gray-100 border ${
                            isSameAuthor ? 'rounded-[20px] rounded-tl-[4px]' : 'rounded-[20px] rounded-tl-[4px] rounded-bl-[4px]'
                          }`
                    }`}
                  >
                    <span className="text-[14.5px] sm:text-[15px] leading-relaxed break-words font-medium">
                      {rawContent ? rawContent : JSON.stringify(msg)}
                    </span>
                    
                    <span className={`text-[9px] self-end mt-1 font-bold whitespace-nowrap opacity-60 ${isMe ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatMessageTime(rawTimestamp)}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* YAZMA ALANI */}
      <div className="shrink-0 w-full bg-white/90 dark:bg-[#050505]/80 backdrop-blur-3xl border-t border-gray-200 dark:border-white/[0.05] pt-3 pb-4 sm:pb-6 px-3 sm:px-4 relative z-50 transition-colors duration-300">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center w-full relative">
          <div className="w-full bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-full flex items-center p-1.5 shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all focus-within:border-blue-400 dark:focus-within:border-[#4DA3FF]/50 focus-within:bg-white dark:focus-within:bg-white/[0.05]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Lobiye bir şeyler fısılda..."
              maxLength={250}
              className="flex-1 bg-transparent text-gray-900 dark:text-white py-2 pl-4 pr-3 outline-none text-[15px] placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="p-2.5 bg-[#4DA3FF] text-white dark:text-black rounded-full hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-[0_0_15px_rgba(77,163,255,0.4)] shrink-0 cursor-pointer flex items-center justify-center"
            >
              <Send size={16} className="translate-x-[1px] translate-y-[-1px] stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>

      {/* KURALLAR POP-UP */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 transition-colors duration-300">
          <div 
            className="m-auto relative w-full max-w-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 p-6 sm:p-8 rounded-[32px] shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={acceptRules}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white bg-gray-100 dark:bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-[#4DA3FF]/10 border border-blue-100 dark:border-[#4DA3FF]/20 text-[#4DA3FF] flex items-center justify-center mb-5 shadow-inner">
              <BookOpen size={24} />
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-2 tracking-tight text-gray-900 dark:text-white">Lobi Kuralları</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
              TNKU Lobi ortamının huzurunu ve neşesini korumak için uyman gereken temel kurallar:
            </p>

            <div className="space-y-3 mb-8 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-3 rounded-xl shadow-inner">
                <span className="text-[#4DA3FF] font-black">01.</span>
                <p>Küfür, hakaret, nefret söylemi ve kişisel hedef gösterme kesinlikle yasaktır.</p>
              </div>
              <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-3 rounded-xl shadow-inner">
                <span className="text-[#4DA3FF] font-black">02.</span>
                <p>Spam yapmak, aynı mesajı sürekli göndermek veya sohbet akışını bozmak yasaktır.</p>
              </div>
              <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-3 rounded-xl shadow-inner">
                <span className="text-[#4DA3FF] font-black">03.</span>
                <p>Kişisel gizliliğe saygı duyulmalı, kimsenin özel bilgileri paylaşılmamalıdır.</p>
              </div>
            </div>

            <button
              onClick={acceptRules}
              className="w-full bg-[#4DA3FF] text-white dark:text-black font-black uppercase tracking-widest py-3.5 rounded-2xl transition-all shadow-[0_4px_15px_rgba(77,163,255,0.3)] hover:shadow-[0_6px_20px_rgba(77,163,255,0.4)] flex items-center justify-center gap-2 active:scale-95 text-xs cursor-pointer"
            >
              <CheckCircle2 size={16} /> Okudum, Anladım
            </button>
          </div>
        </div>
      )}

    </main>
  );
}