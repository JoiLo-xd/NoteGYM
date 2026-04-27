import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from '../headerGym';
import Sidebar from '../Sidebar';

import { apiService } from '../../services/api';

export default function DesbloqUsers() {
    const userRole = (localStorage.getItem('role') as 'admin' | 'user' | 'trainer') || "user";
    const [formData, setFormData] = useState({
        targetUsername: "", // El usuario a desbloquear
        adminUsername: "",  // Credencial del administrador
        adminPassword: "",  // Credencial del administrador
    });
    
    // Estado para feedback
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [serverMessage, setServerMessage] = useState("");
    
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Limpiamos mensajes al editar
        setStatus('idle');
        setServerMessage('');
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setServerMessage("Procesando desbloqueo...");

        const { targetUsername, adminUsername, adminPassword } = formData;

        if (!targetUsername || !adminUsername || !adminPassword) {
            setStatus('error');
            setServerMessage("Todos los campos son obligatorios.");
            return;
        }

        try {
            // Usando el servicio centralizado
            const responseMessage = await apiService.unlockUser(targetUsername, {
                username: adminUsername,
                password: adminPassword
            });

            setStatus('success');
            setServerMessage(responseMessage || `Usuario ${targetUsername} desbloqueado correctamente!`); 
            
            // Limpiar campos después del éxito
            setFormData({
                targetUsername: "",
                adminUsername: "",
                adminPassword: "",
            });

        } catch (error) {
            console.error("Error al desbloquear:", error);
            setStatus('error');
            setServerMessage((error as Error).message || "Fallo al desbloquear el usuario.");
        }
    };
    
    // Función de ayuda para renderizar los mensajes


    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole={userRole} />
            
            <main className="flex-grow pt-24 px-6 pb-10 flex flex-col justify-start items-center">
                <div className="w-full max-w-md mx-auto mt-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
                    
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-3 text-[#FF5722]">
                        Desbloquear Usuario
                    </h2>

            {status !== 'idle' && (
                <div className={`p-3 rounded-lg text-sm text-center font-medium my-4 shadow-sm ${status === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700 animate-pulse'}`}>
                    {serverMessage}
                </div>
            )}

            <form onSubmit={handleUnlock} className="space-y-6">
                
                {/* 1. Usuario a Desbloquear */}
                <div className="flex flex-col">
                    <label htmlFor="targetUsername" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Usuario a Desbloquear
                    </label>
                    <input
                        type="text"
                        name="targetUsername"
                        id="targetUsername"
                        placeholder="target Username"
                        value={formData.targetUsername}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-gray-400 text-gray-800 py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-500"
                        required
                    />
                </div>

                <div className="border-t pt-6 mt-6 space-y-4">
                    <p className="text-sm font-semibold text-gray-600">
                        Confirmación de Administrador
                    </p>
                    
                    {/* 2. Username del Administrador */}
                    <div className="flex flex-col">
                        <label htmlFor="adminUsername" className="block text-sm font-medium text-gray-700 mb-2">
                            Tu Username (Admin)
                        </label>
                        <input
                            type="text"
                            name="adminUsername"
                            id="adminUsername"
                            placeholder="Tu Username (Admin)"
                            value={formData.adminUsername}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-400 text-gray-800 py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-500"
                            required
                        />
                    </div>

                    {/* 3. Password del Administrador */}
                    <div className="flex flex-col">
                        <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Tu Password (Admin)
                        </label>
                        <input
                            type="password"
                            name="adminPassword"
                            id="adminPassword"
                            placeholder="Password"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-400 text-gray-800 py-2 px-1 focus:outline-none focus:border-[#FF5722] transition-colors placeholder-gray-500"
                            required
                        />
                    </div>
                </div>

                {/* Botón de Desbloquear */}
                <button
                    type="submit"
                    className={`w-full mt-6 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-3 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] transition-all duration-200 
                        ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? "Desbloqueando..." : "Desbloquear Cuenta"}
                </button>

            </form>
            
        </div>

        {/* Botón Flotante Volver */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95"
            title="Volver al Dashboard"
        >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        </main>
    </div>
    );
}