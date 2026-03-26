import React from 'react';
import { Navigate } from 'react-router-dom';

// Supongamos que esta función revisa si el token existe en localStorage
const useAuth = () => {
    const token = localStorage.getItem('token'); 
    return !!token; // Devuelve true si el token existe, false si no
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'user' | 'trainer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const isAuthenticated = useAuth();
    // Simulamos la obtención del rol desde localStorage o token decodificado
    const currentRole = (localStorage.getItem('role') || 'user').toLowerCase();
    
    if (!isAuthenticated) {
        // Si no está autenticado, lo envía a la página de login
        return <Navigate to="/loginUserGym" replace />;
    }

    if (requiredRole && currentRole !== requiredRole.toLowerCase()) {
        // Si no tiene el rol, envíalo al Dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Si está autenticado y tiene el rol (o no hay restricción de rol), renderiza el componente hijo
    return <>{children}</>;
}