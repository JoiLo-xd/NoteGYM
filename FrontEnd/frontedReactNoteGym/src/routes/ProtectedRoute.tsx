import React from 'react';
import { Navigate } from 'react-router-dom';

// Supongamos que esta función revisa si el token existe en localStorage
const useAuth = () => {
    const token = localStorage.getItem('jwtToken'); 
    return !!token; // Devuelve true si el token existe, false si no
};

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuth();
    
    if (!isAuthenticated) {
        // Si no está autenticado, lo envía a la página de login
        return <Navigate to="http://localhost:5173/loginUserGym" replace />;
    }

    // Si está autenticado, renderiza el componente hijo (el Dashboard)
    return children;
}