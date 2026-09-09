import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, CheckCheck, Search, Phone, ArrowLeft } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../context/ToastContext';

export default function MitraChat() {
  const toast = useToast();
  const [chats, setChats] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Ambil daftar percakapan
  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      setIsLoadingChats(true);
      try {
        const res = await apiClient.get('/chat/conversation');
        if (isMounted) {
          const list = res.data?.data || res.data || [];
          setChats(list);
          if (list.length > 0 && !selectedConversationId) {
            setSelectedConversationId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Gagal memuat percakapan:', err);
      } finally {
        if (isMounted) setIsLoadingChats(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedConversationId]);

  // 2. Ambil pesan & Polling pesan aktif
  useEffect(() => {
    if (!selectedConversationId) return;

    let isMounted = true;
    const fetchMessages = async (convId) => {
      try {
        const res = await apiClient.get(`/chat/conversation/${convId}/messages`);
        if (isMounted) {
          setMessages(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error('Gagal memuat riwayat pesan:', err);
      }
    };

    fetchMessages(selectedConversationId);
    const interval = setInterval(() => fetchMessages(selectedConversationId), 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const activeChat = chats.find(c => String(c.id) === String(selectedConversationId)) || chats[0];

  const filteredChats = chats.filter((chat) => {
    const term = chatSearchTerm.toLowerCase();
    return (
      (chat.customer?.name || '').toLowerCase().includes(term) ||
      (chat.trip?.id || '').toString().toLowerCase().includes(term)
    );
  });

  const handleSelectChat = async (chat) => {
    setSelectedConversationId(chat.id);
    setShowMobileChat(true);
    
    try {
      const resConv = await apiClient.post('/chat/conversation', {
        tripId: String(chat.trip?.id),
        customerId: String(chat.customer?.id)
      });
      const convId = resConv.data.id;
      setSelectedConversationId(convId);

      const resMsg = await apiClient.get(`/chat/conversation/${convId}/messages`);
      setMessages(resMsg.data?.data || resMsg.data || []);
    } catch (err) {
      console.error('Gagal membuka ruang chat:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await apiClient.post(`/chat/conversation/${selectedConversationId}/messages`, {
        messageText: textToSend
      });
      const sentMsg = res.data;
      setMessages(prev => [...prev, sentMsg]);
    } catch (err) {
      console.error('Gagal mengirim pesan:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan.', { title: 'Gagal' });
      setMessageText(textToSend);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-['Inter'] flex flex-col h-[calc(100vh-2rem)]">
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
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

      {/* Layout Utama Chat ala WhatsApp */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 grid grid-cols-1 lg:grid-cols-3 overflow-hidden flex-1 min-h-0">
        {/* Panel Daftar Chat */}
        <div className={`border-r border-neutral-100 flex flex-col col-span-1 bg-neutral-50/50 min-h-0 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-neutral-100 shrink-0">
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

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100 min-h-0">
            {isLoadingChats ? (
              <div className="p-6 text-center text-[10px] text-neutral-400">Memuat percakapan...</div>
            ) : filteredChats.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[10px] font-bold text-neutral-500">Tidak ada percakapan ditemukan</p>
                <p className="text-[8px] text-neutral-400 mt-0.5">Coba kata kunci lain.</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const custName = chat.customer?.name || 'Pelanggan';
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full text-left p-3.5 transition cursor-pointer flex gap-3 items-start ${
                      String(selectedConversationId) === String(chat.id) ? 'bg-purple-50/80 border-l-4 border-[#4B2172]' : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#4B2172] flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-sm">
                      {custName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[10px] text-neutral-800 truncate">{custName}</span>
                        <span className="text-[8px] text-neutral-400 font-medium">Aktif</span>
                      </div>
                      <p className="text-[8px] font-bold text-[#4B2172] mb-0.5">TRIP-{chat.trip?.id} • {chat.trip?.originPoint?.name} &rarr; {chat.trip?.destinationPoint?.name}</p>
                      <p className="text-[9px] text-neutral-400 truncate">Ketuk untuk melihat pesan</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Obrolan (WhatsApp Style: Header Tetap, Area Pesan Scroll Sendiri, Input Di Bawah) */}
        <div className={`col-span-2 flex flex-col bg-white min-h-0 ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header Chat */}
          <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#4B2172] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                {(activeChat?.customer?.name || 'P').charAt(0)}
              </div>
              <div>
                <h2 className="text-[11px] font-bold text-neutral-800">{activeChat?.customer?.name || 'Pilih Percakapan'}</h2>
                <p className="text-[8px] font-bold text-[#4B2172]">TRIP-{activeChat?.trip?.id}</p>
              </div>
            </div>
            <button className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Area Pesan (Scroll Sendiri, Tidak Memanjang Keluar Halaman) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/40 min-h-0 flex flex-col">
            {messages.length === 0 ? (
              <div className="text-center text-[10px] text-neutral-400 py-10 my-auto">Belum ada pesan dalam percakapan ini.</div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender?.role === 'mitra' || msg.senderRole === 'mitra' || msg.senderId === activeChat?.mitraId;
                return (
                  <div key={index} className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                    <span className="text-[7px] text-neutral-400 mb-0.5">{msg.sender?.name || 'Pengguna'}</span>
                    <div className={`p-2.5 rounded-2xl text-[10px] ${
                      isMe 
                        ? 'bg-[#4B2172] text-white rounded-br-none' 
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm'
                    }`}>
                      <p>{msg.messageText || msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[8px] text-neutral-400">
                      <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#4B2172]" />}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Chat Di Bawah (Menempel Sempurna ala WhatsApp) */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-neutral-100 bg-white flex items-center gap-2.5 shrink-0">
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Ketik pesan balasan ke pelanggan..."
              className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-medium text-neutral-800 focus:outline-none focus:border-[#4B2172]"
            />
            <button 
              type="submit"
              disabled={!messageText.trim()}
              className="p-2.5 bg-[#4B2172] hover:bg-[#3a1a59] text-white rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}