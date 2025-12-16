import React from 'react';
// Importamos el nuevo componente
import CalendarWidget from './CalendarWidget'; 
// Asumo que el Sidebar y DashboardCard están definidos si los necesitas, 
// pero solo mantendré la estructura que enviaste.

export default function DashboardGym() {
    // ... tus estados y useEffect si los usas ...

    return (
        // Mantengo el contenedor original que centras el contenido
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                
                <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                    👋 Bienvenid@ a tu Dashboard
                </h1>
                
                {/* AÑADIMOS EL CALENDARIO AQUÍ */}
                <h2 className="text-3xl font-semibold text-center mb-8 text-[#FF5722]">
                    Tu Calendario de Entrenamiento
                </h2>
                
                <div className="mb-10">
                    <CalendarWidget />
                </div>
                
                
                {/* Dejo la sección de las tarjetas, por si la quieres usar más abajo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="Tu Perfil" content="Gestiona tu información personal y membresía." />
                    <DashboardCard title="Entrenamientos" content="Visualiza tus rutinas y progreso semanal." />
                    <DashboardCard title="Estadísticas" content="Revisa tus récords y evolución de fuerza." />
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