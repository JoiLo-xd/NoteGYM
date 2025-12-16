import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080"; 

export default function DesbloqUsers() {
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

    const UNLOCK_URL = `${API_BASE_URL}/api/user/${targetUsername}/desblock`; 

    try {
        const res = await fetch(UNLOCK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': adminUsername, 
                'password': adminPassword,
            },
            body: JSON.stringify({
                username: adminUsername, 
                password: adminPassword,
            })
        });

        // --- MANEJO DE LA RESPUESTA ---
        let responseContent = null;
        let responseText = null;
        
        // 1. Intentar leer como JSON
        // Verificamos si la respuesta no está vacía antes de intentar leer
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            try {
                responseContent = await res.json();
            } catch (e) {
                // Si el servidor prometió JSON pero falló (ej. JSON mal formado)
                console.warn("Fallo al parsear JSON, intentando leer como texto.", e);
            }
        }
        
        // 2. Si no es JSON o falló el parseo, intentar leer como texto (para errores o mensajes simples)
        if (!responseContent && res.status !== 204 && res.headers.get('content-length') !== '0') {
             responseText = await res.text();
        }

        // 3. LÓGICA DE RESPUESTA FINAL
        if (res.ok) {
            setStatus('success');
            
            // Prioridad para el mensaje de éxito:
            // a) Mensaje del JSON (si existe)
            // b) Texto plano (si existe)
            // c) Mensaje predeterminado
            const successMsg = responseContent?.message || responseText || `Usuario ${targetUsername} desbloqueado correctamente!`;
            
            setServerMessage(successMsg); 
            
            // Limpiar campos después del éxito
            setFormData({
                targetUsername: "",
                adminUsername: "",
                adminPassword: "",
            });

        } else {
            // Manejar errores (4xx, 5xx)
            setStatus('error');
            
            // Prioridad para el mensaje de error:
            // a) Mensaje del JSON (si existe)
            // b) Texto plano (si existe)
            // c) Mensaje predeterminado de error
            const errorMsg = responseContent?.message || responseText || `Error ${res.status}: Fallo al desbloquear el usuario.`;
            
            setServerMessage(errorMsg);
        }

    } catch (error) {
        // Este catch captura errores de red o la imposibilidad de leer cualquier tipo de respuesta.
        console.error("Error de conexión:", error);
        setStatus('error');
        setServerMessage("Error de red: No se pudo conectar con el servidor.");
    }
};
    
    // Función de ayuda para renderizar los mensajes
    const FeedbackMessage = () => {
        if (status === 'idle') return null;
        
        const baseClass = "p-3 rounded-lg text-sm text-center font-medium my-4 shadow-sm";
        const successClass = "bg-green-100 border border-green-400 text-green-700";
        const errorClass = "bg-red-100 border border-red-400 text-red-700 animate-pulse";
        
        return (
            <div className={`${baseClass} ${status === 'success' ? successClass : errorClass}`}>
                {serverMessage}
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
            
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-3 text-[#FF5722]">
                Desbloquear Usuario
            </h2>

            <FeedbackMessage />

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
    );
}