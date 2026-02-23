import React from "react";
import CalendarWidget from "./CalendarWidget";

interface DashboardGymProps {
  userRole: "admin" | "user" | "trainer";
  userName: string;
}

export default function DashboardGym({ userRole, userName }: DashboardGymProps) {
  const welcomeMessage = `👋 Bienvenid@ ${userName}`;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col gap-3 items-center text-center">
          <h1 className="text-4xl font-bold text-gray-800">{welcomeMessage}</h1>

          <p className="text-lg text-gray-600">
            Planifica entrenos, asigna rutinas y añade notas por día.
          </p>

          {/* Quick actions (sin lógica aún) */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button className="px-5 py-3 rounded-xl bg-[#FF5722] text-white font-semibold hover:bg-[#F4511E] transition">
              + Crear nota
            </button>
            <button className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
              Asignar rutina
            </button>
            <button className="px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition">
              Ver rutinas
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-[#FF5722] mb-4">
              Tu calendario de entrenamiento
            </h2>
            <CalendarWidget />
          </div>

          {/* Panel del día (placeholder bonito, sin inventar backend) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Panel del día
              </h3>
              <p className="text-gray-600 mb-4">
                Aquí verás la rutina y las notas del día seleccionado.
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Rutina</p>
                  <p className="text-gray-800 font-medium">
                    Ninguna rutina asignada.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="text-gray-800 font-medium">
                    Aún no hay notas para este día.
                  </p>
                </div>

                <button className="w-full px-4 py-3 rounded-xl bg-[#FF5722] text-white font-semibold hover:bg-[#F4511E] transition">
                  Añadir nota
                </button>
              </div>
            </div>

            {userRole === "admin" && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800">
                Panel de Administración Activo
              </div>
            )}
          </div>
        </div>

        {/* Bottom cards (sin la de notas) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Tu Perfil"
            content="Gestiona tu información personal y membresía."
          />
          <DashboardCard
            title="Entrenamientos"
            content="Visualiza tus rutinas y progreso semanal."
          />
          <DashboardCard
            title="Estadísticas"
            content="Revisa tus récords y evolución de fuerza."
          />
        </div>
      </div>
    </div>
  );
}

const DashboardCard = ({ title, content }: { title: string; content: string }) => (
  <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl transition duration-300">
    <h3 className="text-xl font-semibold text-[#FF5722] mb-2">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </div>
);