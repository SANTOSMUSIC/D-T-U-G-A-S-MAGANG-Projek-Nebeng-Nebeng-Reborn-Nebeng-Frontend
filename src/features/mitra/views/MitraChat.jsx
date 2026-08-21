import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, Search, Phone } from 'lucide-react';

export default function MitraChat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState('');
  
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

  // Fungsi untuk memilih chat sekaligus mereset notif unread menjadi 0
  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
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
    <div className="min-h-screen bg-[#f8f9fa] w-full p-8 flex flex-col">
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-[11px] uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" /> Komunikasi Langsung
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">In-App Messaging Pelanggan</h1>
          <p className="text-neutral-500 text-xs mt-0.5">Berkomunikasi secara langsung dengan pelanggan yang memesan trip atau paket pos Anda.</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 grid grid-cols-1 lg:grid-cols-3 overflow-hidden flex-1 h-[650px]">
        
        {/* Daftar Kontak / Chat List */}
        <div className="border-r border-neutral-100 flex flex-col col-span-1 bg-neutral-50/50">
          <div className="p-4 border-b border-neutral-100">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                placeholder="Cari pelanggan atau trip..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-pink-600"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left p-4 transition cursor-pointer flex gap-3 items-start ${
                  selectedChat === chat.id ? 'bg-pink-50/60 border-l-4 border-pink-600' : 'hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-extrabold shrink-0 shadow-sm">
                  {chat.customerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-extrabold text-xs text-neutral-900 truncate">{chat.customerName}</span>
                    <span className="text-[10px] text-neutral-500 font-medium">{chat.time}</span>
                  </div>
                  <p className="text-[10px] font-bold text-pink-600 mb-1">{chat.tripCode} • {chat.route}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-pink-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Ruang Percakapan / Chat Room */}
        <div className="col-span-2 flex flex-col bg-white">
          {/* Header Chat Aktif */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-extrabold shadow-sm">
                {activeChat.customerName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xs font-extrabold text-neutral-900">{activeChat.customerName}</h2>
                <p className="text-[10px] font-bold text-pink-600">{activeChat.tripCode} ({activeChat.route})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Isi Pesan */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-50/30">
            {activeChat.messages.map((msg, index) => {
              const isMitra = msg.sender === 'mitra';
              return (
                <div key={index} className={`flex flex-col ${isMitra ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-md p-4 rounded-2xl text-xs font-medium shadow-sm ${
                    isMitra 
                      ? 'bg-pink-600 text-white rounded-br-none' 
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-500">
                    <span>{msg.time}</span>
                    {isMitra && <CheckCheck className="w-3 h-3 text-pink-600" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Chat */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-100 bg-white flex items-center gap-3">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ketik pesan balasan ke pelanggan..."
              className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-medium text-neutral-900 focus:outline-none focus:border-pink-600"
            />
            <button 
              type="submit"
              className="p-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl transition shadow-lg shadow-pink-900/20 cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}