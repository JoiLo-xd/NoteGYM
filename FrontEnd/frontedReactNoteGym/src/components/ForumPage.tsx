import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderGym from "./headerGym";
import Sidebar from "./Sidebar";

interface Message {
  id: number;
  text: string;
  senderId: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  type: "private" | "group";
  lastMessage: string;
  unread: number;
}

const MOCK_CHATS: Chat[] = [
  { id: "g1", name: "🔥 Gym Bros", type: "group", lastMessage: "¿Quién se apunta a pierna hoy?", unread: 3 },
  { id: "g2", name: "🏃‍♂️ Cardio Killers", type: "group", lastMessage: "Mañana salimos a correr a las 8", unread: 0 },
  { id: "u1", name: "David Ruiz", type: "private", lastMessage: "Pásame la rutina de ayer bro", unread: 1 },
  { id: "u2", name: "Entrenador NoteGYM", type: "private", lastMessage: "Revisé tus métricas, vas genial.", unread: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "g1": [
    { id: 1, text: "Gente, ¿hoy toca pecho o qué?", senderId: "u5", timestamp: "10:30" },
    { id: 2, text: "Nah, yo ayer hice Push. Hoy toca pierna sí o sí.", senderId: "u3", timestamp: "10:32" },
    { id: 3, text: "¿Quién se apunta a pierna hoy?", senderId: "me", timestamp: "10:35" },
  ],
  "u1": [
    { id: 1, text: "Bro, brutal el entreno de ayer", senderId: "u1", timestamp: "Ayer" },
    { id: 2, text: "Ya ves, estoy destrozado", senderId: "me", timestamp: "09:15" },
    { id: 3, text: "Pásame la rutina de ayer bro", senderId: "u1", timestamp: "09:20" },
  ]
};

export default function ForumPage() {
  const navigate = useNavigate();
  const userRole = (localStorage.getItem("role") as "admin" | "user" | "trainer" | null) || "user";
  const [activeTab, setActiveTab] = useState<"todos" | "privados" | "grupos">("todos");
  const [activeChat, setActiveChat] = useState<string>("g1");
  const [inputText, setInputText] = useState("");
  const [messagesDB, setMessagesDB] = useState<Record<string, Message[]>>(MOCK_MESSAGES);

  const filteredChats = MOCK_CHATS.filter(chat => {
    if (activeTab === "privados") return chat.type === "private";
    if (activeTab === "grupos") return chat.type === "group";
    return true;
  });

  const currentMessages = messagesDB[activeChat] || [];
  const currentChatDetails = MOCK_CHATS.find(c => c.id === activeChat);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: new Date().getTime(),
      text: inputText,
      senderId: "me",
      timestamp: "Ahora"
    };

    setMessagesDB(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage]
    }));
    
    setInputText("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <HeaderGym />
      <Sidebar userRole={userRole} />

      {/* Main Container adaptado con margen superior para el Header */}
      <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 pb-6 flex justify-center">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[80vh]">
          
          {/* BARRA LATERAL DEL CHAT (ZONA IZQUIERDA) */}
          <div className="w-full md:w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col h-[40vh] md:h-auto">
            {/* Cabecera Sidebar Chat */}
            <div className="p-5 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Comunidad</h2>
              
              {/* Filtros */}
              <div className="flex space-x-2 mt-4 bg-gray-100 p-1 rounded-xl">
                {(["todos", "privados", "grupos"] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-sm font-bold capitalize rounded-lg transition-all ${
                      activeTab === tab 
                        ? "bg-[#FF5722] text-white shadow-md transform scale-105" 
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Buscador */}
            <div className="p-4 bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar chat o grupo..." 
                  className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#FF5722] focus:bg-white transition-colors"
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>

            {/* Listado de Chats */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {filteredChats.map(chat => (
                  <li 
                    key={chat.id} 
                    onClick={() => setActiveChat(chat.id)}
                    className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors flex items-center group ${activeChat === chat.id ? 'bg-orange-50 border-l-4 border-[#FF5722]' : 'border-l-4 border-transparent'}`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${chat.type === 'group' ? 'bg-gray-800 text-white' : 'bg-orange-100 text-[#FF5722]'}`}>
                        {chat.name.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${chat.type === 'private' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    </div>
                    
                    {/* Info */}
                    <div className="ml-4 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h4 className="text-gray-900 font-bold truncate">{chat.name}</h4>
                        <span className="text-xs text-gray-400 font-medium">10:45</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${chat.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unread > 0 && (
                      <div className="ml-2 w-6 h-6 bg-[#FF5722] rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                        {chat.unread}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* VENTANA DEL CHAT (ZONA DERECHA) */}
          <div className="flex-1 flex flex-col bg-[#fafafa]">
            {/* Chat Cabecera */}
            <div className="h-20 border-b border-gray-200 bg-white flex items-center px-6 justify-between shadow-sm z-10">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${currentChatDetails?.type === 'group' ? 'bg-gray-800' : 'bg-[#FF5722]'}`}>
                  {currentChatDetails?.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-black text-gray-800">{currentChatDetails?.name}</h3>
                  <p className="text-xs text-green-500 font-bold">
                    {currentChatDetails?.type === "group" ? "3 participantes online" : "En línea"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 text-gray-400">
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4 bg-slate-50">
              <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 mx-10">Hoy</div>
              
              {currentMessages.length === 0 ? (
                <div className="m-auto text-gray-400 flex flex-col items-center">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  <p>Inicia la conversación enviando un mensaje.</p>
                </div>
              ) : (
                currentMessages.map((msg, i) => {
                  const isMe = msg.senderId === "me";
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      {!isMe && (
                         <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-bold flex items-center justify-center mr-2 text-xs shadow-sm">
                           U
                         </div>
                      )}
                      
                      <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm relative group ${isMe ? 'bg-[#FF5722] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                        {!isMe && msg.senderId !== "u1" && currentChatDetails?.type === "group" && (
                          <span className="text-xs font-bold text-[#FF5722] mb-1 block">Rafa GymBro</span>
                        )}
                        <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        <span className={`text-[10px] mt-2 block text-right font-medium ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Área de Envío */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <button type="button" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                </button>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 resize-none h-14 focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition-shadow"
                  placeholder="Escribe un mensaje para entrenar..."
                ></textarea>
                <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className={`p-4 rounded-xl flex items-center justify-center transition-all ${inputText.trim() ? 'bg-[#FF5722] text-white shadow-md hover:bg-[#F4511E] hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      {/* Botón Flotante Volver */}
      <button 
          onClick={() => navigate('/dashboard')}
          className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95"
          title="Volver al Dashboard"
      >
          <svg className="w-7 h-7 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

    </div>
  );
}
