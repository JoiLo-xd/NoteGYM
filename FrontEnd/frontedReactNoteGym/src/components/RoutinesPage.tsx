import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContinuousCalendar } from "./ContinuousCalendar";

// Tipo para las rutinas
interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: string[];
}

// Datos de prueba
const MOCK_ROUTINES: Routine[] = [
  { 
    id: "1", 
    name: "Push Day - Pecho, Hombro, Tríceps", 
    description: "Entrenamiento de empuje centrado en hipertrofia y ganar fuerza en los principales movimientos de empuje.",
    exercises: ["Press Banca", "Press Militar", "Fondos", "Extensiones Tríceps"]
  },
  { 
    id: "2", 
    name: "Pull Day - Espalda, Bíceps", 
    description: "Entrenamiento de tracción enfocado en fuerza, ganar amplitud y grosor en la espalda.",
    exercises: ["Dominadas", "Remo con Barra", "Jalón al pecho", "Curl Bíceps"]
  },
  { 
    id: "3", 
    name: "Leg Day - Pierna completa", 
    description: "Trabajo completo de tren inferior para fuerza y masa muscular balanceada.",
    exercises: ["Sentadilla Libre", "Prensa 45", "Peso Muerto Rumano", "Elevación Talones"]
  },
  { 
    id: "4", 
    name: "Full Body - Mantenimiento", 
    description: "Sesión global de cuerpo entero para mantenimiento y atletas con poco tiempo.",
    exercises: ["Sentadilla", "Press Banca", "Remo", "Press Militar"]
  }
];

export default function RoutinesPage() {
  const navigate = useNavigate();

  // Estados
  const [assignedRoutines, setAssignedRoutines] = useState<Record<string, Routine[]>>({});
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [assignDate, setAssignDate] = useState("");

  // Cargar estado inicial desde localStorage (para sincronizar con el Dashboard)
  useEffect(() => {
    const saved = localStorage.getItem("user_assigned_routines");
    if (saved) {
      setAssignedRoutines(JSON.parse(saved));
    }
  }, []);

  const handleAssignClick = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsAssignModalOpen(true);
    setAssignDate("");
    setShowCalendarDropdown(false);
  };

  const handleSaveAssignment = () => {
    if (!selectedRoutine || !assignDate) return;

    // Desglosar la fecha (YYYY-MM-DD)
    const [yearStr, monthStr, dayStr] = assignDate.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1; 
    const day = parseInt(dayStr, 10);
    
    // Usamos el mismo formato de clave que el dashboard
    const key = `${year}-${monthIndex}-${day}`;

    const updatedRoutines = {
      ...assignedRoutines,
      [key]: [...(assignedRoutines[key] || []), selectedRoutine]
    };

    setAssignedRoutines(updatedRoutines);
    localStorage.setItem("user_assigned_routines", JSON.stringify(updatedRoutines));

    setIsAssignModalOpen(false);
    setSelectedRoutine(null);
    setAssignDate("");

    // Pequeño feedback visual o redirección (opcional, por ahora solo cerramos)
    alert(`¡Rutina ${selectedRoutine.name} asignada correctamente al día seleccionado!`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* Header & Nav */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#FF5722] hover:bg-orange-50 transition shadow-sm"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722] tracking-tight">Biblioteca de Rutinas</h1>
            <p className="text-gray-600 mt-1">Explora y asigna rutinas a tu calendario de entrenamiento.</p>
          </div>
        </div>

        {/* Listado de Rutinas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_ROUTINES.map(routine => (
            <div key={routine.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition flex flex-col h-full">
              <div className="flex-1">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF5722] mb-4">
                  <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{routine.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{routine.description}</p>
                
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ejercicios Principales</p>
                  <div className="flex flex-wrap gap-2">
                    {routine.exercises.map((ex, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleAssignClick(routine)}
                className="w-full mt-auto px-4 py-3 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-md hover:-translate-y-0.5"
              >
                + Asignar a un día
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Modal de Asignación */}
      {isAssignModalOpen && selectedRoutine && (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-12 sm:pt-20 px-4 pb-4 overflow-y-auto bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 mb-12 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#FF5722] tracking-tight">Asignar Rutina</h3>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="text-gray-400 hover:text-[#FF5722] transition bg-gray-50 hover:bg-orange-50 p-2.5 rounded-xl"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-800/60 uppercase tracking-widest mb-1">Rutina seleccionada:</p>
              <p className="font-bold text-gray-800">{selectedRoutine.name}</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">¿Qué día quieres hacerla?</label>
                <div 
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition text-sm font-medium"
                >
                  <span className={assignDate ? "text-gray-800" : "text-gray-400"}>
                    {assignDate ? assignDate : "Seleccionar fecha en el calendario..."}
                  </span>
                  <svg className="size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                
                {showCalendarDropdown && (
                  <div className="absolute top-[105%] left-0 w-full z-[60] animate-in slide-in-from-top-2 duration-200 shadow-2xl rounded-3xl pb-2 bg-white">
                    <ContinuousCalendar 
                      onClick={(day, month, year) => {
                        setAssignDate(`${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                        setShowCalendarDropdown(false);
                      }} 
                    />
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <button 
                  onClick={handleSaveAssignment}
                  disabled={!assignDate}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#FF5722] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#F4511E] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm uppercase tracking-widest"
                >
                  Confirmar Asignación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
