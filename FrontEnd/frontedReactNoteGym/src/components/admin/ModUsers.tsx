import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Descomenta si lo necesitas

// Definición de roles para el combobox
type Role = 'admin' | 'trainer' | 'user';

// Interfaz para la data del usuario que estamos modificando
interface UserData {
    id: string;
    username: string;
    currentRole: Role;
}

export default function ModUsers() {
    // *** ESTADO MOCK: Simula la carga inicial de un usuario (debería venir de una API) ***
    const [userToModify, setUserToModify] = useState<UserData>({
        id: '12345',
        username: 'juan.perez',
        currentRole: 'user', // Rol inicial
    });
    
    // Estado para el rol seleccionado en el combobox
    const [newRole, setNewRole] = useState<Role>(userToModify.currentRole);
    
    // Estado para feedback (cargando, éxito, error)
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const roles: Role[] = ['admin', 'trainer', 'user'];
    const navigate = useNavigate(); // Descomenta si vas a usar redirecciones

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewRole(e.target.value as Role);
    };

    const handleModifyRole = async () => {
        if (newRole === userToModify.currentRole) {
            setMessage("El nuevo rol es el mismo que el actual.");
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage(`Modificando el rol de ${userToModify.username} a ${newRole}...`);

        try {
            // Aquí iría tu fetch a Spring Boot (e.g., PUT http://localhost:8080/api/admin/users/{id})
            // Es crucial incluir el token de administrador en la cabecera 'Authorization'.
            
            // --- SIMULACIÓN DE API ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // Si la API es exitosa:
            setUserToModify(prev => ({ ...prev, currentRole: newRole }));
            setStatus('success');
            setMessage(`¡Rol modificado a ${newRole} correctamente!`);

        } catch (e) {
            setStatus('error');
            setMessage("Error al modificar el rol en el servidor.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(`¿Estás seguro de que quieres ELIMINAR la cuenta de ${userToModify.username}? Esta acción es irreversible.`)) {
            return;
        }

        setStatus('loading');
        setMessage(`Eliminando la cuenta de ${userToModify.username}...`);

        try {
            // Aquí iría tu fetch a Spring Boot (e.g., DELETE http://localhost:8080/api/admin/users/{id})

            // --- SIMULACIÓN DE API ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // Si la API es exitosa:
            setStatus('success');
            setMessage(`¡Cuenta de ${userToModify.username} eliminada con éxito!`);
            
            navigate('/dashboard');
            setUserToModify({ id: '', username: 'Eliminado', currentRole: 'user' }); 

        } catch (e) {
            setStatus('error');
            setMessage("Error al intentar eliminar la cuenta.");
        }
    };

    // Componente interno para mostrar feedback
    const FeedbackMessage = () => {
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

    return (
        <div className="w-full max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
            
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center border-b pb-3 text-[#FF5722]">
                Gestión de Cuenta
            </h2>

            <FeedbackMessage />

            <div className="space-y-6">
                
                {/* Campo de Nombre de Usuario (Solo lectura) */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de Usuario
                    </label>
                    {/* Estilo de campo de solo lectura */}
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-lg font-mono text-gray-800 shadow-inner">
                        {userToModify.username || 'N/A'} 
                    </div>
                </div>

                {/* Combobox para Cambiar el Rol */}
                <div className="flex flex-col">
                    <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Rol Actual: <span className="font-bold text-[#FF5722] capitalize">{userToModify.currentRole}</span>
                    </label>
                    <div className="relative">
                        <select
                            id="role-select"
                            name="newRole"
                            value={newRole}
                            onChange={handleRoleChange}
                            className="w-full bg-white border border-gray-400 text-gray-800 py-3 px-3 pr-10 rounded-lg focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition-colors appearance-none"
                            disabled={status === 'loading' || !userToModify.id}
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

            {/* Contenedor de Botones (Separados y Distinguibles) */}
            <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row gap-4">
                
                {/* Botón para Modificar Rol (Acción Primaria) */}
                <button
                    onClick={handleModifyRole}
                    className={`sm:flex-1 bg-[#FF5722] hover:bg-[#F4511E] text-black font-bold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(255,87,34,0.39)] transition-all duration-200 
                        ${(status === 'loading' || !userToModify.id || newRole === userToModify.currentRole) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    disabled={status === 'loading' || !userToModify.id || newRole === userToModify.currentRole}
                >
                    {status === 'loading' && message.includes('Modificando') ? 'Modificando...' : 'Modificar Rol'}
                </button>

                {/* Botón para Eliminar Cuenta (Acción Destructiva) */}
                <button
                    onClick={handleDeleteAccount}
                    className={`sm:flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 
                        ${status === 'loading' || !userToModify.id ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    disabled={status === 'loading' || !userToModify.id}
                >
                    {status === 'loading' && message.includes('Eliminando') ? 'Eliminando...' : 'Eliminar Cuenta'}
                </button>
                
            </div>
            
        </div>
    );
}