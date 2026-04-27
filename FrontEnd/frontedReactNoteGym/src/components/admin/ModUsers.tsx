import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from '../headerGym';
import Sidebar from '../Sidebar';
import { apiService } from '../../services/api';

// Definición de roles para el combobox
type Role = 'admin' | 'trainer' | 'user';

export default function ModUsers() {
    const userRole = (localStorage.getItem('role') as 'admin' | 'user' | 'trainer') || "user";
    const navigate = useNavigate();
    // Estado para el usuario que se va a modificar/eliminar
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [newRole, setNewRole] = useState<Role>('user');
    
    // Estado para feedback (cargando, éxito, error)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const roles: Role[] = ['admin', 'trainer', 'user'];

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewRole(e.target.value as Role);
    };

    const handleModifyRole = async () => {
        if (!usernameInput.trim()) {
            setMessage("Introduce el nombre de usuario.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage(`Modificando el rol de ${usernameInput} a ${newRole}...`);

        try {
            // Usando el servicio centralizado
            await apiService.updateUserAdmin(usernameInput, { role: newRole });

            setStatus('success');
            setMessage(`¡Rol de ${usernameInput} modificado a ${newRole} correctamente!`);

        } catch (e) {
            console.error("Error al modificar rol:", e);
            setStatus('error');
            setMessage((e as Error).message || "Error al modificar el rol en el servidor.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!usernameInput.trim()) {
            setMessage("Introduce el nombre de usuario que vas a eliminar.");
            setStatus('error');
            return;
        }

        if (!window.confirm(`¿Estás seguro de que quieres ELIMINAR la cuenta de ${usernameInput}? Esta acción es irreversible.`)) {
            return;
        }

        setStatus('loading');
        setMessage(`Eliminando la cuenta de ${usernameInput}...`);

        try {
            // Usando el servicio centralizado
            await apiService.deleteUserAdmin(usernameInput);

            setStatus('success');
            setMessage(`¡Cuenta de ${usernameInput} eliminada con éxito!`);
            setUsernameInput('');

        } catch (e) {
            console.error("Error al eliminar cuenta:", e);
            setStatus('error');
            setMessage((e as Error).message || "Error al intentar eliminar la cuenta.");
        }
    };

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole={userRole} />
            
            <main className="flex-grow pt-24 px-6 pb-10 flex flex-col justify-start items-center">
                
                <div className="w-full max-w-lg p-6 mt-4 bg-white rounded-xl shadow-2xl border border-gray-200">
                    
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-3 text-[#FF5722]">
                        Gestión de Cuenta
                    </h2>

            <FeedbackMessage status={status} message={message} />

            <div className="space-y-6">
                
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username a modificar
                    </label>
                    <input 
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Escribe el nombre de usuario..."
                        className="bg-white border border-gray-400 rounded-lg p-3 text-lg text-gray-800 shadow-inner focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]"
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Nuevo Rol a Asignar
                    </label>
                    <div className="relative">
                        <select
                            id="role-select"
                            name="newRole"
                            value={newRole}
                            onChange={handleRoleChange}
                            className="w-full bg-white border border-gray-400 text-gray-800 py-3 px-3 pr-10 rounded-lg focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors appearance-none"
                            disabled={status === 'loading'}
                        >
                            {roles.map((role) => (
                                <option key={role} value={role} className="capitalize">
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                        {/* Ícono de flecha para el select */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row gap-4">
                
                {/* Botón para Modificar Rol (Acción Primaria) */}
                <button
                    onClick={handleModifyRole}
                    className={`sm:flex-1 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] transition-all duration-200 
                        ${(status === 'loading' || !usernameInput.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    disabled={status === 'loading' || !usernameInput.trim()}
                >
                    {status === 'loading' && message.includes('Modificando') ? 'Modificando...' : 'Modificar Rol'}
                </button>

                {/* Botón para Eliminar Cuenta (Acción Destructiva) */}
                <button
                    onClick={handleDeleteAccount}
                    className={`sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 
                        ${status === 'loading' || !usernameInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    disabled={status === 'loading' || !usernameInput.trim()}
                >
                    {status === 'loading' && message.includes('Eliminando') ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
                
            </div>
            
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

// Componente de feedback movido fuera para evitar errores de renderizado
interface FeedbackProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
}

const FeedbackMessage = ({ status, message }: FeedbackProps) => {
    if (status === 'idle' || status === 'loading') return null;
    
    const baseClass = "p-3 rounded-lg text-sm text-center font-medium my-4 shadow-sm";
    const successClass = "bg-green-100 border border-green-400 text-green-700";
    const errorClass = "bg-red-100 border border-red-400 text-red-700 animate-pulse";
    
    return (
        <div className={`${baseClass} ${status === 'success' ? successClass : errorClass}`}>
            {message}
        </div>
    );
};