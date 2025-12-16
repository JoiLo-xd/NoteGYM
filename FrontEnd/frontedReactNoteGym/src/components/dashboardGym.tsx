import React from 'react';
import CalendarWidget from './CalendarWidget'; 

interface DashboardGymProps {
    userRole: 'admin' | 'user' | 'trainer';
    userName: string;
}

export default function DashboardGym({ userRole, userName }: DashboardGymProps) {
    const welcomeMessage = `👋 Bienvenid@ ${userName}`;
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center mt-20 p-10">
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                
                <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                    {welcomeMessage}
                </h1>
                
                <h2 className="text-3xl font-semibold text-center mb-8 text-[#FF5722]">
                    Tu Calendario de Entrenamiento
                </h2>
                
                <div className="mb-10">
                    <CalendarWidget />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="Tu Perfil" content="Gestiona tu información personal y membresía." />
                    <DashboardCard title="Entrenamientos" content="Visualiza tus rutinas y progreso semanal." />
                    <DashboardCard title="Estadísticas" content="Revisa tus récords y evolución de fuerza." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                </div>

                {userRole === 'admin' && (
                    <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                        Panel de Administración Activo
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                    <DashboardCard title="" content="" />
                </div>
                
            </div>
        </div>
    );
}

const DashboardCard = ({ title, content }: { title: string, content: string }) => (
    <div className="p-5 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold text-[#FF5722] mb-2">{title}</h3>
        <p className="text-gray-600">{content}</p>
    </div>
);