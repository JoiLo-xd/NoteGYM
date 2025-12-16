import React, { useState, useEffect } from 'react';
import HeaderGym from "../components/headerGym";
import DashboardGym from "../components/dashboardGym";
import Sidebar from "@/components/Sidebar";

type UserRole = 'admin' | 'user' | 'trainer';

export default function DashboardRoute() {
    const [userRole, setUserRole] = useState<UserRole>('user'); 
    const [userName, setUserName] = useState<string>('Usuario'); 

    useEffect(() => {
        const fetchUserData = () => {
            
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