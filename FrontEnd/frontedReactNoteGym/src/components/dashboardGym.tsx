import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ContinuousCalendar } from "@/components/ContinuousCalendar";
import { useSnack } from "./SnackProvider";

interface DashboardGymProps {
  userRole?: "admin" | "user" | "trainer";
  userName?: string;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: { name: string }[];
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DashboardGym({ userRole: propsRole, userName: propsName }: DashboardGymProps) {
  const userName = propsName || localStorage.getItem('username') || "Usuario de Prueba";
  const userRole = propsRole || (localStorage.getItem('role') as "admin" | "user" | "trainer" | null) || "admin";
  const { createSnack } = useSnack();

  const welcomeMessage = `👋 Bienvenid@ ${userName}`;

  // Estados del panel de día
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [assignedRoutines, setAssignedRoutines] = useState<Record<string, Routine[]>>(() => {
    const saved = localStorage.getItem('user_assigned_routines');
    return saved ? JSON.parse(saved) : {};
  });
  
  const navigate = useNavigate();

  // Opcional: recargar en background si hay cambios en localStorage para mantener en sync
  useEffect(() => {
    const interval = setInterval(() => {
        const sr = localStorage.getItem('user_assigned_routines');
        if(sr) setAssignedRoutines(JSON.parse(sr));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDateClick = (day: number, month: number, year: number) => {
    setSelectedDate({ day, month, year });
  };

  // Obtener rutinas del día seleccionado
  const dateKey = selectedDate ? `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}` : "";

  const handleRemoveRoutine = (dateKeyParam: string, routineIndex: number) => {
    if (!assignedRoutines[dateKeyParam]) return;

    if (!window.confirm("¿Quitar este entrenamiento del día seleccionado?")) return;
    
    const updatedRoutinesList = assignedRoutines[dateKeyParam].filter((_, idx) => idx !== routineIndex);
    
    const updatedRoutines = {
      ...assignedRoutines,
      [dateKeyParam]: updatedRoutinesList
    };
    
    setAssignedRoutines(updatedRoutines);
    localStorage.setItem('user_assigned_routines', JSON.stringify(updatedRoutines));
    createSnack("Entrenamiento retirado del día seleccionado", "success");
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col gap-2 items-center text-center">
          <h1 className="text-3xl font-bold text-gray-800">{welcomeMessage}</h1>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <button 
              onClick={() => navigate('/entrenar')}
              className="px-8 py-4 rounded-xl bg-gray-900 text-white font-black text-xl hover:bg-gray-800 transition shadow-lg hover:-translate-y-1 hover:shadow-xl flex-1 flex items-center justify-center gap-2 uppercase tracking-wide border border-gray-800"
            >
              🏋️‍♂️ ¡IR A ENTRENAR!
            </button>
            <button 
              onClick={() => navigate('/rutinas')}
              className="px-6 py-4 rounded-xl bg-[#FF5722] text-white font-bold text-xl hover:bg-[#F4511E] transition shadow-md hover:-translate-y-1 hover:shadow-lg flex-1 flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              🚀 Gestionar
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 mb-2 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">

          {/* Calendario */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <ContinuousCalendar 
              onClick={(day, month, year) => handleDateClick(day, month, year)} 
              dotsMap={useMemo(() => {
                const map: Record<string, { hasRoutine: boolean; hasNote: boolean }> = {};
                Object.keys(assignedRoutines).forEach(k => {
                  if (assignedRoutines[k].length > 0) {
                    map[k] = { hasRoutine: true, hasNote: false };
                  }
                });
                return map;
              }, [assignedRoutines])}
            />
          </div>

          {/* Panel del día */}
          <div className="lg:col-span-1 lg:mt-12 lg:-ml-11 lg:mr-12 transition-transform">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all min-h-[300px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Panel del día
              </h3>

              {!selectedDate ? (
                <div className="text-gray-500 mb-4 flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  {/* Icono de calendario decorativo */}
                  <svg className="size-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="font-semibold text-gray-600">Ningún día seleccionado</p>
                  <p className="text-sm mt-1">Haz clic en el calendario para ver los eventos.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                  <p className="text-sm font-bold uppercase tracking-wider text-[#FF5722] mb-6 border-b border-gray-100 pb-2">
                    {selectedDate.day} de {monthNames[selectedDate.month]} de {selectedDate.year}
                  </p>

                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Entrenamientos de Hoy</p>
                    {assignedRoutines[dateKey] && assignedRoutines[dateKey].length > 0 ? (
                      <div className="space-y-3">
                        {assignedRoutines[dateKey].map((rutina, idx) => (
                          <div key={idx} className="group bg-white p-4 rounded-xl border border-[#FF5722]/20 shadow-sm relative pr-10 hover:border-[#FF5722] transition-colors">
                            <p className="text-gray-900 font-bold text-md mb-1 break-words pr-2">{rutina.name}</p>
                            
                            <div className="mt-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 line-clamp-1">Ejercicios ({rutina.exercises?.length || 0})</p>
                              {rutina.exercises && rutina.exercises.length > 0 ? (
                                <ul className="text-gray-600 text-[11px] font-medium space-y-1 list-inside list-disc">
                                  {rutina.exercises.map((ex, i) => (
                                    <li key={i}>{ex.name}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-gray-400 text-xs italic">Rutina vacía, configúrala en el Gestor.</p>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemoveRoutine(dateKey, idx)}
                              className="absolute right-3 top-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50"
                              title="Quitar rutina de este día"
                            >
                              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6 text-center mt-2">
                        <p className="text-orange-800 font-semibold text-sm mb-2">¡Día Libre!</p>
                        <p className="text-orange-900/60 text-xs leading-relaxed">
                          No tienes entrenamientos asignados. Tómate un descanso o añade carga desde "Gestionar Entrenamientos".
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {userRole === "admin" && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm font-semibold flex items-center gap-2">
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Panel de Administración Activo
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Botón flotante del Foro/Comunidad */}
      <button
        onClick={() => navigate('/comunidad')}
        className="fixed bottom-8 left-8 w-16 h-16 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95 border border-orange-400"
        title="Comunidad"
      >
        <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

    </div>
  );
}