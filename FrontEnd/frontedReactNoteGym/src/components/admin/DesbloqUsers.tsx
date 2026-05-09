import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from '../headerGym';
import Sidebar from '../Sidebar';
import { apiService } from '../../services/api';
import type { User } from '../../services/api';

export default function DesbloqUsers() {
    const userRole = (localStorage.getItem('role') as 'admin' | 'user' | 'trainer') || "user";
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetUsername, setTargetUsername] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [serverMessage, setServerMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const all = await apiService.getAllUsers();
            setUsers(all);
        } catch (err) {
            console.error('Error cargando usuarios', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const blockedUsers = users.filter(u => u.blocked === true);

    const handleUnlock = async (username: string) => {
        setStatus('loading');
        setServerMessage('');
        try {
            const msg = await apiService.unblockUserAdmin(username);
            setStatus('success');
            setServerMessage(msg || `Cuenta de ${username} desbloqueada correctamente.`);
            setTargetUsername('');
            await fetchUsers(); // Refresca la lista
        } catch (error) {
            setStatus('error');
            setServerMessage((error as Error).message || 'Fallo al desbloquear el usuario.');
        }
    };

    const handleManualUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUsername.trim()) return;
        await handleUnlock(targetUsername.trim());
    };

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole={userRole} />

            <main className="flex-grow pt-24 px-6 pb-10">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722]">Desbloquear Cuentas</h1>
                        <p className="text-gray-600 mt-1">Gestiona las cuentas bloqueadas por intentos fallidos de acceso.</p>
                    </div>

                    {status !== 'idle' && (
                        <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${status === 'success' ? 'bg-green-100 border border-green-300 text-green-700' : status === 'error' ? 'bg-red-100 border border-red-300 text-red-700 animate-pulse' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
                            {serverMessage}
                        </div>
                    )}

                    {/* Usuarios bloqueados */}
                    <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">🔒 Cuentas Bloqueadas</h2>
                        <p className="text-gray-500 text-sm mb-5">Usuarios que han superado el límite de 3 intentos fallidos.</p>

                        {loading ? (
                            <p className="text-gray-400 italic text-sm">Cargando usuarios...</p>
                        ) : blockedUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <span className="text-4xl mb-3">✅</span>
                                <p className="text-gray-500 font-medium">No hay cuentas bloqueadas actualmente.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {blockedUsers.map(u => (
                                    <div key={u.username} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-800">{u.username}</p>
                                            <p className="text-xs text-gray-500">{u.mail} · {u.role}</p>
                                        </div>
                                        <button
                                            onClick={() => handleUnlock(u.username)}
                                            disabled={status === 'loading'}
                                            className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl text-sm transition shadow-md disabled:opacity-50"
                                        >
                                            {status === 'loading' ? '...' : 'Desbloquear'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desbloqueo manual por nombre */}
                    <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">🔑 Desbloqueo Manual</h2>
                        <p className="text-gray-500 text-sm mb-5">Introduce el username para desbloquearlo manualmente.</p>
                        <form onSubmit={handleManualUnlock} className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Username del usuario"
                                value={targetUsername}
                                onChange={e => { setTargetUsername(e.target.value); setStatus('idle'); }}
                                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800"
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
                            >
                                {status === 'loading' ? '...' : 'Desbloquear'}
                            </button>
                        </form>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 z-40"
                    title="Volver al Dashboard"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
            </main>
        </div>
    );
}