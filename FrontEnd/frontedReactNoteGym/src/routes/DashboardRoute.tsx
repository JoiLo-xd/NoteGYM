import React, { useState, useEffect } from 'react';
import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";
import { useNavigate } from 'react-router-dom';

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
                // 2. Realizar la solicitud al endpoint de user/perfil
                const USER_URL = 'http://localhost:8080/api/user/perfil'; 
                //alert(localStorage.getItem('username') + " " + localStorage.getItem('password') + " " + localStorage.getItem('name'));
                const res = await fetch(USER_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    const userRoleFromServer = data.role.toLowerCase() as UserRole;
                    const userNameFromServer = data.name || data.username || '';

                    setUserRole(userRoleFromServer);
                    setUserName(userNameFromServer);
                    
                } else {
                    console.error(`Error al obtener datos del perfil: ${res.status}`);

                }
            } catch (error) {
                console.error("Error de conexión al obtener datos del usuario:", error);
                //navigate('/loginUserGym');
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