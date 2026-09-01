import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, CheckCheck, Search, Phone, ArrowLeft } from 'lucide-react';

export default function MitraChat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [chats, setChats] = useState([
    {
      id: 1,
      customerName: 'Budi Santoso',
      tripCode: 'TRIP-701',
      route: 'Solo → Yogyakarta',
      lastMessage: 'Halo Kak, posisi armada di mana ya? Paket saya titip di depan ya.',
      time: '07:45 WIB',
      unread: 2,
      messages: [
        { sender: 'customer', text: 'Halo Kak, selamat pagi.', time: '07:30 WIB' },
        { sender: 'customer', text: 'Halo Kak, posisi armada di mana ya? Paket saya titip di depan ya.', time: '07:45 WIB' }
      ]
    },
    {
      id: 2,
      customerName: 'Siti Rahma',
      tripCode: 'TRIP-702',
      route: 'Solo → Semarang',
      lastMessage: 'Baik Kak, saya tunggu di titik jemput pos ya.',
      time: 'Kemarin',
      unread: 0,
      messages: [
        { sender: 'mitra', text: 'Halo Kak Siti, untuk trip Solo-Semarang besok siap ya?', time: '16:00 WIB' },
        { sender: 'customer', text: 'Baik Kak, saya tunggu di titik jemput pos ya.', time: '16:05 WIB' }
      ]
    }
  ]);

  const activeChat = chats.find(c => c.id === selectedChat) || chats[0];

  // Auto-scroll ke pesan terbaru setiap kali pesan baru masuk/terkirim
  // atau saat pindah percakapan.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages.length, selectedChat]);

  const filteredChats = chats.filter((chat) => {
    const term = chatSearchTerm.toLowerCase();
    return (
      chat.customerName.toLowerCase().includes(term) ||
      chat.tripCode.toLowerCase().includes(term) ||
      chat.route.toLowerCase().includes(term)
    );
  });

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    setShowMobileChat(true);
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, unread: 0 } : chat
      )
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          lastMessage: messageText,
          time: 'Baru saja',
          messages: [
            ...chat.messages,
            { sender: 'mitra', text: messageText, time: 'Baru saja' }
          ]
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessageText('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen font-['Inter'] flex flex-col">
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4B2172] animate-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4B2172] flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> KOMUNIKASI LANGSUNG
            </span>
          </div>
          <h1 className="text-[18px] sm:text-[20px] font-bold text-neutral-800">
            In-App Messaging Pelanggan
          </h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
            Berkomunikasi secara langsung dengan pelanggan yang memesan trip atau paket pos Anda.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 grid grid-cols-1 lg:grid-cols-3 overflow-hidden flex-1 h-[600px]">
        {/* Panel Daftar Chat */}
        <div className={`border-r border-neutral-100 flex flex-col col-span-1 bg-neutral-50/50 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-neutral-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Cari pelanggan atau trip..." 
                value={chatSearchTerm}
                onChange={(e) => setChatSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-neutral-200 rounded-xl text-[10px] font-medium focus:outline-none focus:border-[#4B2172]"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100">
            {filteredChats.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[10px] font-bold text-neutral-500">Tidak ada percakapan ditemukan</p>
                <p className="text-[8px] text-neutral-400 mt-0.5">Coba kata kunci lain.</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full text-left p-3.5 transition cursor-pointer flex gap-3 items-start ${
                    selectedChat === chat.id ? 'bg-purple-50/80 border-l-4 border-[#4B2172]' : 'hover:bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#4B2172] flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-sm">
                    {chat.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[10px] text-neutral-800 truncate">{chat.customerName}</span>
                      <span className="text-[8px] text-neutral-400 font-medium">{chat.time}</span>
                    </div>
                    <p className="text-[8px] font-bold text-[#4B2172] mb-0.5">{chat.tripCode} • {chat.route}</p>
                    <p className="text-[9px] text-neutral-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-[#4B2172] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panel Obrolan */}
        <div className={`col-span-2 flex flex-col bg-white ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#4B2172] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {activeChat.customerName.charAt(0)}
              </div>
              <div>
                <h2 className="text-[11px] font-bold text-neutral-800">{activeChat.customerName}</h2>
                <p className="text-[8px] font-bold text-[#4B2172]">{activeChat.tripCode} ({activeChat.route})</p>
              </div>
            </div>
            <button className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/40">
            {activeChat.messages.map((msg, index) => {
              const isMitra = msg.sender === 'mitra';
              return (
                <div key={index} className={`flex flex-col ${isMitra ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-[10px] font-medium shadow-sm ${
                    isMitra 
                      ? 'bg-[#4B2172] text-white rounded-br-none' 
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[8px] text-neutral-400">
                    <span>{msg.time}</span>
                    {isMitra && <CheckCheck className="w-3 h-3 text-[#4B2172]" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-neutral-100 bg-white flex items-center gap-2.5">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ketik pesan balasan ke pelanggan..."
              className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172]"
            />
            <button 
              type="submit"
              className="p-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}