import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Datos de los elementos del menú
const menuItems = [
    { name: "Inicio", path: "/dashboard" },
    { name: "Mi Perfil", path: "/profile" },
    { name: "Mis Rutinas", path: "/routines" },
    { name: "Estadísticas", path: "/stats" },
    // Aquí puedes añadir más enlaces (ej: /settings, /contact)
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        // 1. Limpiar el token de autenticación
        //localStorage.removeItem('token'); 
        localStorage.removeItem('username'); 
        localStorage.removeItem('password'); 
        
        // 2. Redirigir al usuario a la página de login
        navigate('/loginUserGym');
    };

    return (
        <>
            {/* Botón de Hamburguesa (Fijo en la esquina superior izquierda) */}
            <div className="fixed top-4 left-4 z-50">
                <button onClick={toggleSidebar} className="p-2 bg-[#FF5722] rounded-lg shadow-lg hover:bg-[#F4511E] transition duration-300">
                    {/* Icono de Hamburguesa */}
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-7 w-7 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Overlay para cerrar el menú al hacer click fuera (oscurece la pantalla) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40" 
                    onClick={toggleSidebar}
                />
            )}

            {/* Menú Lateral Desplegable (Sidebar) */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-8 text-[#FF5722]">NoteGym Menu</h2>
                    
                    {/* Lista de Enlaces */}
                    <nav>
                        <ul className="space-y-4">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        to={item.path} 
                                        className="block p-2 rounded hover:bg-gray-700 transition duration-150 text-lg"
                                        onClick={toggleSidebar} // Cierra el menú al navegar
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            
                            {/* Enlace de Cerrar Sesión */}
                            <li>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left p-2 mt-4 rounded bg-red-600 hover:bg-red-700 transition duration-150 text-lg font-semibold"
                                >
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}