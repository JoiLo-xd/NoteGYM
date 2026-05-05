import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 1. Definimos los tipos de props que recibirá el componente
interface SidebarProps {
    userRole: 'admin' | 'user' | 'trainer';
}

const baseMenuItems = [
    { name: "Inicio", path: "/dashboard" },
    { name: "Mi Perfil", path: "/profile" },
    { name: "Mis Rutinas", path: "/rutinas" },
    { name: "Entrenar", path: "/entrenar" },
    { name: "Comunidad", path: "/comunidad" },
    { name: "Estadísticas", path: "/stats" },
];

const adminMenuItems = [
    { name: "Añadir Usuario", path: "/admin/AddUser" },
    { name: "Modificar Usuarios", path: "/admin/ModUsers" },
    { name: "Desbloquear Usuarios", path: "/DesbloquearUsers" }
];

const trainerMenuItems = [
    { name: "🏋️ Gestión Entrenador", path: "/trainer" },
];

export default function Sidebar({ userRole }: SidebarProps) { 
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    const SCROLL_THRESHOLD = 50; 

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('username'); 
        localStorage.removeItem('password'); 
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/loginUserGym');
    };

    const finalMenuItems = userRole === 'admin' 
        ? [...baseMenuItems, ...adminMenuItems] 
        : userRole === 'trainer'
        ? [...baseMenuItems, ...trainerMenuItems]
        : baseMenuItems;


    return (
        <>
            <div 
                className={`fixed left-4 z-50 transition-all duration-300 ease-in-out 
                    ${isScrolled ? 'top-1' : 'top-2'}
                    ${isOpen ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`
                }
            >
                <button onClick={toggleSidebar} className="p-1 bg-[#FF5722] rounded-xl shadow-lg hover:bg-[#F4511E] transition duration-300">
                    <img
                        src="/logo.jpg" 
                        alt="Abrir Menú"
                        className="h-9 w-9 object-cover rounded-lg" 
                    />
                </button>
            </div>

            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={toggleSidebar}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-8 text-[#FF5722]">NoteGym Menu</h2>
                    
                    <nav>
                        <ul className="space-y-4">
                            {finalMenuItems.map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        to={item.path} 
                                        className="block p-2 rounded hover:bg-gray-700 transition duration-150 text-lg"
                                        onClick={toggleSidebar} 
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            
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