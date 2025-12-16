import React, { useState, useEffect } from 'react';
import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";

type UserRole = 'admin' | 'user' | 'trainer';

export default function DashboardRoute() {
    // 1. NUEVOS ESTADOS PARA EL ROL Y EL NOMBRE DEL USUARIO
    const [userRole, setUserRole] = useState<UserRole>('user'); 
    const [userName, setUserName] = useState<string>('Usuario'); 

    useEffect(() => {
        // Lógica para obtener el rol del usuario (esto debe ser asíncrono en un entorno real)
        const fetchUserData = () => {
            
            // --- SIMULACIÓN DE CARGA DE DATOS ---
            // En una aplicación real, decodificarías el JWT o harías un fetch a tu API de Spring Boot
            // utilizando el token JWT guardado en localStorage.
            
            // EJEMPLO DE SIMULACIÓN DE ROL: Cambia 'ADMIN' por 'USER' o 'TRAINER' para probar
            const simulatedRole: UserRole = 'admin'; 
            const simulatedUsername = 'AdminMaster';
            // ------------------------------------

            setUserRole(simulatedRole);
            setUserName(simulatedUsername);
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