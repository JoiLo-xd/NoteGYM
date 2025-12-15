import React from 'react';

export default function DashboardGym() {
    // Más tarde, aquí puedes usar useEffect para cargar datos del usuario
    // const [userData, setUserData] = React.useState(null);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                    👋 Bienvenid@ a tu Dashboard
                </h1>
                
                {/* Aquí es donde irán los contenidos específicos de tu aplicación: */}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <DashboardCard title="Tu Perfil" content="Gestiona tu información personal y membresía." />
                    <DashboardCard title="Entrenamientos" content="Visualiza tus rutinas y progreso semanal." />
                    <DashboardCard title="Estadísticas" content="Revisa tus récords y evolución de fuerza." />
                </div>
                
                <div className="mt-10 text-center">
                    <button 
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                        onClick={() => {
                            // Más tarde, aquí pondrás la lógica de cierre de sesión
                            console.log('Cerrar sesión...');
                        }}
                    >
                        Cerrar Sesión
                    </button>
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