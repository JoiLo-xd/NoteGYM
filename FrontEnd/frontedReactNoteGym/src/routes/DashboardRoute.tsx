import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";
import { apiService } from "../services/api";

type UserRole = 'admin' | 'user' | 'trainer';

export default function DashboardRoute() {
    const [userRole, setUserRole] = useState<UserRole>('user'); 
    const [userName, setUserName] = useState<string>('Usuario'); 

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUsername = localStorage.getItem('username');
            const storedRole = localStorage.getItem('role') as UserRole || 'user';
            
            setUserName(storedUsername || '');
            setUserRole(storedRole);
            
            if (!storedUsername || !localStorage.getItem('token')) {
                console.error("No se encontró usuario o token. Redirigiendo al login...");
                navigate('/loginUserGym'); 
                return;
            }

            try {
                // Usando el servicio centralizado
                const data = await apiService.getProfile();
                
                const userRoleFromServer = data.role?.toLowerCase() as UserRole;
                const userNameFromServer = data.name || data.username || '';

                setUserRole(userRoleFromServer || 'user');
                setUserName(userNameFromServer);
                    
            } catch (error) {
                console.error("Error al obtener datos del perfil:", error);
                // Si el token ha expirado, podríamos redirigir al login
                // navigate('/loginUserGym');
            }
        };
        
        fetchUserData();
    }, []);

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym alwaysCompact={true} />
            
            <Sidebar userRole={userRole} /> 
            
            <main className="flex-grow pt-24 px-6 pb-10">
                <DashboardGym userRole={userRole} userName={userName} /> 
            </main>
        </div>
    );
}