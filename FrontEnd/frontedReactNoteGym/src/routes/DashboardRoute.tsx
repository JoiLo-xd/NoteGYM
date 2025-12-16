import React, { useState, useEffect } from 'react';
import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";
import { Link, useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'user' | 'trainer';

export default function DashboardRoute() {
    const [userRole, setUserRole] = useState<UserRole>('user'); 
    const [userName, setUserName] = useState<string>('Usuario'); 

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            // 1. Obtener el token JWT de localStorage
            //const token = localStorage.getItem('token'); 
            setUserName(localStorage.getItem('username') || '');
            setUserRole(localStorage.getItem('role') as UserRole || 'user');
            const password = localStorage.getItem('password');
            
            // Si no hay token, redirigimos al login (esto se hace mejor en ProtectedRoute, pero es una buena verificación aquí)
            if (!userName || !password) {
                console.error("No se encontró usuario. Redirigiendo al login...");
                // Aquí podrías usar useNavigate si este componente no es una ruta principal
                // O dejar que el ProtectedRoute se encargue.
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
                        'username': localStorage.getItem('username') || "",
                        'password': localStorage.getItem('password') || "",
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
        <div className="min-h-screen flex flex-col">
            <HeaderGym />
            
            <Sidebar userRole={userRole} /> 
            
            <main className="flex-grow flex items-center justify-center p-4">
                <DashboardGym userRole={userRole} userName={userName} /> 
            </main>
        </div>
    );
}