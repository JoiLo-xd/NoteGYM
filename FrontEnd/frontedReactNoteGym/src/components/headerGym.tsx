import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import type { SupportTicket } from '../services/api';

interface HeaderGymProps {
    alwaysCompact?: boolean;
}

export default function HeaderGym({ alwaysCompact = false }: HeaderGymProps) {
    const [isScrolled, setIsScrolled] = useState(alwaysCompact);
    const SCROLL_THRESHOLD = 50;

    // Tickets panel (solo admin)
    const isAdmin = (localStorage.getItem('role') || '').toLowerCase() === 'admin';
    const [ticketCount, setTicketCount] = useState(0);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [showTickets, setShowTickets] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (alwaysCompact) return;
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [alwaysCompact]);

    // Poll ticket count every 30s (only if admin)
    useEffect(() => {
        if (!isAdmin) return;
        const fetchCount = async () => {
            try {
                const count = await apiService.getUnreadTicketCount();
                setTicketCount(count);
            } catch { /* silencioso */ }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setShowTickets(false);
            }
        };
        if (showTickets) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showTickets]);

    const handleOpenTickets = async () => {
        if (showTickets) { setShowTickets(false); return; }
        try {
            const data = await apiService.getUnreadTickets();
            setTickets(data);
            setShowTickets(true);
        } catch { /* silencioso */ }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await apiService.markTicketRead(id);
            setTickets(prev => prev.filter(t => t.id !== id));
            setTicketCount(prev => Math.max(0, prev - 1));
        } catch { /* silencioso */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiService.markAllTicketsRead();
            setTickets([]);
            setTicketCount(0);
        } catch { /* silencioso */ }
    };

    const headerClasses = `
        fixed top-0 left-0 w-full z-30 transition-all duration-300 ease-in-out bg-gray-900 shadow-xl
        ${isScrolled ? 'h-16 p-2' : 'h-24 p-4'}
    `;
    const textSizeClass = isScrolled ? 'text-xl' : 'text-3xl';

    return (
        <header className={headerClasses}>
            <div className="flex mx-auto justify-center items-center h-full relative">
                <div className={`flex items-center transition-all duration-300`}>
                    <span className={`font-bold transition-all duration-300 ${textSizeClass}`} style={{ color: "#FF5722" }}>
                        NoteGym
                    </span>
                </div>

                {/* Icono de tickets — solo admin */}
                {isAdmin && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={panelRef}>
                        <button
                            onClick={handleOpenTickets}
                            className="relative p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition text-white"
                            title="Mensajes de soporte"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {ticketCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#FF5722] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    {ticketCount > 99 ? '99+' : ticketCount}
                                </span>
                            )}
                        </button>

                        {/* Panel desplegable de tickets */}
                        {showTickets && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">📬 Mensajes de soporte</p>
                                        <p className="text-xs text-gray-500">{tickets.length} pendiente{tickets.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    {tickets.length > 0 && (
                                        <button onClick={handleMarkAllRead} className="text-xs text-[#FF5722] hover:underline font-semibold">
                                            Marcar todos
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                    {tickets.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <span className="text-3xl block mb-2">✅</span>
                                            <p className="text-gray-400 text-sm">No hay mensajes pendientes</p>
                                        </div>
                                    ) : (
                                        tickets.map(t => (
                                            <div key={t.id} className="p-3 hover:bg-gray-50 transition group">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-[#FF5722] mb-0.5">@{t.username}</p>
                                                        <p className="text-sm text-gray-700 leading-snug break-words">{t.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkRead(t.id)}
                                                        className="shrink-0 text-gray-300 hover:text-green-500 transition mt-0.5"
                                                        title="Marcar como leído"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}