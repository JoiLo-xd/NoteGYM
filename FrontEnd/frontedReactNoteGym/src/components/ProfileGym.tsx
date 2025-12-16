import React, { useState, useEffect } from 'react';

// Define la estructura de los datos del usuario
interface UserData {
    name: string;
    username: string;
    email: string;
    sexo: string; // Sexo también debería estar visible si se registró
    // Nota: La contraseña no se debe cargar aquí, solo se ofrece la opción de CAMBIARLA
}

// Datos de ejemplo (sustituye esto por la carga real de tu API)
const initialData: UserData = {
    name: "Juan Pérez García",
    username: "JuanPGym",
    email: "juan.perez@notegym.com",
    sexo: "HOMBRE",
};

export default function ProfileGym() {
    // Estado que mantiene la versión actual de los datos (la que se muestra y se edita)
    const [formData, setFormData] = useState<UserData>(initialData);
    
    // Estado para controlar qué campos están en modo edición
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado para mensajes de feedback (éxito o error al guardar)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Estado para la nueva contraseña (gestionada por separado por seguridad)
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    // Lógica para cargar los datos del usuario al inicio (simulado)
    useEffect(() => {
        // Aquí iría el fetch real a tu API (ej: /api/auth/profile)
        // usando el token JWT guardado en localStorage.
        
        // Simulación de carga exitosa:
        // fetch('/api/auth/profile', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        //   .then(res => res.json()).then(data => setFormData(data));

    }, []);

    // Maneja los cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Maneja el envío del formulario (Guardar cambios)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // 1. Validaciones básicas de cliente
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }

        // 2. Preparar los datos a enviar
        const dataToSave = {
            ...formData,
            // Solo incluimos la contraseña si se ha modificado
            ...(newPassword && { password: newPassword }),
        };

        // 3. Simulación de la petición al servidor (reemplazar con tu fetch real)
        try {
            // const res = await fetch('/api/auth/updateProfile', { ... dataToSave ... });

            // Simulación de éxito
            console.log("Datos enviados al servidor:", dataToSave);
            setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
            setIsEditing(false);
            setNewPassword(""); // Limpiar campos de contraseña después del éxito
            setConfirmPassword("");

        } catch (error) {
            setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
        }
    };
    
    return (
        // Contenedor principal con margen para dejar espacio al Header y Sidebar
        <div className="pt-24 min-h-screen bg-gray-100 flex justify-center p-4">
            
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                    Mi Perfil
                </h1>

                {/* Mensaje de Feedback */}
                {message && (
                    <div className={`p-3 rounded mb-4 text-sm text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSave}>
                    
                    {/* Botón de Edición/Guardar */}
                    <div className="flex justify-end mb-6">
                        {isEditing ? (
                            <button
                                type="submit"
                                className="bg-[#FF5722] hover:bg-[#F4511E] text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                            >
                                Guardar Cambios
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                            >
                                Editar Perfil
                            </button>
                        )}
                    </div>

                    {/* GRUPO DE DATOS (NO-EDITABLES por defecto) */}
                    <div className="space-y-6">
                        
                        {/* 1. Nombre Completo */}
                        <ProfileInput
                            label="Nombre Completo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isEditing={isEditing}
                        />

                        {/* 2. Email */}
                        <ProfileInput
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isEditing={isEditing}
                            type="email"
                        />

                        {/* 3. Nombre de Usuario */}
                        <ProfileInput
                            label="Nombre de Usuario"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            isEditing={isEditing}
                        />

                        {/* 4. Sexo (Normalmente no se edita, pero lo mostramos) */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-300">
                            <label className="text-lg font-medium text-gray-600">Sexo</label>
                            <span className="text-lg text-gray-800 font-semibold">{formData.sexo}</span>
                        </div>
                        
                        {/* GRUPO DE CAMBIO DE CONTRASEÑA (Solo aparece si se está editando) */}
                        {isEditing && (
                            <div className="pt-6 border-t border-gray-300 space-y-4">
                                <h3 className="text-xl font-bold text-[#FF5722] mb-4">Cambiar Contraseña</h3>
                                
                                <ProfileInput
                                    label="Nueva Contraseña"
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    isEditing={true}
                                    type="password"
                                    placeholder="Deja vacío si no quieres cambiar"
                                />
                                
                                <ProfileInput
                                    label="Confirmar Contraseña"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    isEditing={true}
                                    type="password"
                                />
                            </div>
                        )}
                    </div>
                </form>

            </div>
        </div>
    );
}

// Componente auxiliar para un input de perfil
interface ProfileInputProps {
    label: string;
    name: keyof UserData | string; // Permite las claves de UserData o la clave de la contraseña
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
    type?: string;
    placeholder?: string;
}

const ProfileInput: React.FC<ProfileInputProps> = ({ label, name, value, onChange, isEditing, type = "text", placeholder }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-gray-300">
            <label htmlFor={name.toString()} className="text-lg font-medium text-gray-600 mb-1 md:mb-0">
                {label}
            </label>
            
            {isEditing ? (
                // Modo Edición: Input Activo
                <input
                    id={name.toString()}
                    name={name.toString()}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder || label}
                    className="w-full md:w-2/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5722] transition duration-150 text-lg text-gray-800"
                    required={type !== 'password' ? true : false} // Contraseña no es requerida si se quiere dejar vacía
                />
            ) : (
                // Modo Lectura: Muestra el texto
                <span className="text-lg text-gray-800 font-semibold md:w-2/3 md:text-right">
                    {value}
                </span>
            )}
        </div>
    );
};