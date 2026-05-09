import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ContinuousCalendar } from "./ContinuousCalendar";
import HeaderGym from "./headerGym";
import Sidebar from "./Sidebar";
import { apiService } from "../services/api";
import type { Exercise as ApiExercise, Workout } from "../services/api";
import { useSnack } from "../context/SnackContext";

const userRole = () => (localStorage.getItem('role') || 'user').toLowerCase();
const isTrainerOrAdmin = () => ['trainer', 'admin'].includes(userRole());

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  isGlobal: boolean;
}

// Funciones para mapear datos del back
const mapApiExercise = (ex: ApiExercise): Exercise => ({
  id: String(ex.id),
  name: ex.name,
  muscle: ex.type || "",
  equipment: ex.description || ""
});

const mapApiWorkout = (w: Workout): Routine => ({
  id: String(w.id),
  name: w.name,
  description: w.description,
  exercises: (w.exercises || []).map(mapApiExercise),
  isGlobal: false
});

export default function RoutinesPage() {
  const navigate = useNavigate();
  const { createSnack } = useSnack();
  const canCreate = isTrainerOrAdmin();

  // Estados persistentes
  const [assignedRoutines, setAssignedRoutines] = useState<Record<string, Routine[]>>(() => {
    const saved = localStorage.getItem("user_assigned_routines");
    return saved ? JSON.parse(saved) : {};
  });

  const [globalExercises, setGlobalExercises] = useState<Exercise[]>([]);
  const [personalExercises, setPersonalExercises] = useState<Exercise[]>([]);
  const [globalRoutines, setGlobalRoutines] = useState<Routine[]>([]);
  const [personalRoutines, setPersonalRoutines] = useState<Routine[]>([]);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const [gEx, pEx, gWo, pWo] = await Promise.all([
          apiService.getGlobalExercises(),
          apiService.getPersonalExercises(),
          apiService.getGlobalWorkouts(),
          apiService.getPersonalWorkouts(),
        ]);
        setGlobalExercises(gEx.map(mapApiExercise));
        setPersonalExercises(pEx.map(mapApiExercise));
        setGlobalRoutines(gWo.map(mapApiWorkout));
        setPersonalRoutines(pWo.map(mapApiWorkout));
      } catch (err) {
        console.error("Error cargando datos del backend:", err);
      }
    };
    loadData();
  }, []);

  // Estados UI
  const [activeTab, setActiveTab] = useState<"globales" | "personales" | "ejercicios">("globales");
  const [exerciseSubTab, setExerciseSubTab] = useState<"globales" | "personales">("globales");
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [assignDate, setAssignDate] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  
  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  // Form states
  const [exForm, setExForm] = useState({ name: "", muscle: "", equipment: "" });
  const [routForm, setRoutForm] = useState({ id: "", name: "", description: "", selectedExercises: [] as Exercise[], targetUser: "", originalExercises: [] as Exercise[] });

  const handleOpenEdit = (routine: Routine, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutForm({
      id: routine.id,
      name: routine.name,
      description: routine.description,
      selectedExercises: [...routine.exercises],
      originalExercises: [...routine.exercises],
      targetUser: ""
    });
    setIsRoutineModalOpen(true);
  };

  const handleAssignClick = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsAssignModalOpen(true);
    setAssignDate("");
    setShowCalendarDropdown(false);
  };

  const handleSaveAssignment = () => {
    if (!selectedRoutine || !assignDate) return;
    const [yearStr, monthStr, dayStr] = assignDate.split("-");
    const key = `${parseInt(yearStr)}-${parseInt(monthStr) - 1}-${parseInt(dayStr)}`;
    
    const routinesOnDay = assignedRoutines[key] || [];
    const alreadyAssigned = routinesOnDay.some(r => r.id === selectedRoutine.id);
    
    if (alreadyAssigned) {
      createSnack("¡Este entrenamiento ya está asignado a este día!", "error");
      return;
    }

    const updated = { ...assignedRoutines, [key]: [...routinesOnDay, selectedRoutine] };
    setAssignedRoutines(updated);
    localStorage.setItem("user_assigned_routines", JSON.stringify(updated));
    setIsAssignModalOpen(false);
    setSelectedRoutine(null);
    setAssignDate("");
    createSnack("¡Rutina asignada correctamente al calendario!", "success");
  };

  const handleSaveExercise = async () => {
    if(!exForm.name) return;
    try {
      const payload = { name: exForm.name, type: exForm.muscle, description: exForm.equipment, videoUrl: "", imagePath: "", durationTime: 0 };
      const savedEx = await apiService.createExercise(payload);
      const newEx = mapApiExercise(savedEx);
      setPersonalExercises(prev => [...prev, newEx]);
      setIsExerciseModalOpen(false);
      setExForm({ name: "", muscle: "", equipment: "" });
      createSnack("Ejercicio creado con éxito", "success");
    } catch (err) {
      console.error(err);
      createSnack("Error creando ejercicio en el servidor", "error");
    }
  };

  const handleSaveRoutine = async () => {
    if(!routForm.name || routForm.selectedExercises.length === 0) {
      alert("Por favor, introduce un nombre y selecciona al menos un ejercicio.");
      return;
    }
    try {
      if (routForm.id) {
        // Edit mode
        await apiService.updateWorkout(Number(routForm.id), {
          name: routForm.name, description: routForm.description, exercises: []
        });

        // Handle exercises diff
        const originalIds = routForm.originalExercises.map(e => e.id);
        const selectedIds = routForm.selectedExercises.map(e => e.id);

        const toAdd = routForm.selectedExercises.filter(e => !originalIds.includes(e.id));
        const toRemove = routForm.originalExercises.filter(e => !selectedIds.includes(e.id));

        for (const ex of toAdd) {
          await apiService.addExerciseToWorkout(Number(routForm.id), ex.id);
        }
        for (const ex of toRemove) {
          await apiService.removeExerciseFromWorkout(Number(routForm.id), ex.id);
        }

        const updatedRoutine: Routine = {
          id: routForm.id,
          name: routForm.name,
          description: routForm.description,
          exercises: routForm.selectedExercises,
          isGlobal: false
        };

        setPersonalRoutines(prev => prev.map(r => r.id === routForm.id ? updatedRoutine : r));
        createSnack("Rutina actualizada correctamente", "success");
      } else {
        // Create mode
        let savedWorkout;
        if (routForm.targetUser.trim()) {
          // Trainer crea para usuario específico
          savedWorkout = await apiService.createWorkoutForUser(routForm.targetUser.trim(), {
            name: routForm.name, description: routForm.description, exercises: []
          });
        } else {
          savedWorkout = await apiService.createWorkout({
            name: routForm.name, description: routForm.description, exercises: []
          });
        }

        for (const ex of routForm.selectedExercises) {
          await apiService.addExerciseToWorkout(savedWorkout.id!, ex.id);
        }

        const newRoutine: Routine = {
          id: String(savedWorkout.id),
          name: routForm.name,
          description: routForm.description,
          exercises: routForm.selectedExercises,
          isGlobal: false
        };

        // Si es para otro usuario no lo añadimos a la lista local
        if (!routForm.targetUser.trim()) {
          setPersonalRoutines(prev => [...prev, newRoutine]);
        }
        createSnack(routForm.targetUser.trim() ? `Rutina creada para ${routForm.targetUser}` : "Rutina creada correctamente", "success");
      }
      setIsRoutineModalOpen(false);
      setRoutForm({ id: "", name: "", description: "", selectedExercises: [], targetUser: "", originalExercises: [] });
    } catch (err) {
      console.error(err);
      createSnack(routForm.id ? "Error actualizando la rutina" : "Error creando la rutina", "error");
    }
  };

  const handleDeleteExercise = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
    try {
      await apiService.deleteExercise(id);
      setPersonalExercises(prev => prev.filter(ex => ex.id !== id));
      createSnack("Ejercicio eliminado", "success");
    } catch(err) {
      console.error(err);
      createSnack("No se pudo eliminar el ejercicio", "error");
    }
  };

  const handleDeleteRoutine = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!window.confirm("¿Seguro que deseas eliminar este entrenamiento?")) return;
    try {
      await apiService.deleteWorkout(Number(id));
      setPersonalRoutines(prev => prev.filter(r => r.id !== id));
      createSnack("Rutina eliminada", "success");
    } catch(err) {
      console.error(err);
      createSnack("No se pudo eliminar el entrenamiento", "error");
    }
  };

  const toggleSelectExerciseForRoutine = (ex: Exercise) => {
    setRoutForm(prev => {
      const exists = prev.selectedExercises.find(e => e.id === ex.id);
      if(exists) {
        return { ...prev, selectedExercises: prev.selectedExercises.filter(e => e.id !== ex.id) };
      }
      return { ...prev, selectedExercises: [...prev.selectedExercises, ex] };
    });
  };

  // Evitamos duplicados usando un Map (un Admin obtiene los mismos ejercicios como globales y personales)
  const allExercisesForPicker = Array.from(new Map([...globalExercises, ...personalExercises].map(ex => [ex.id, ex])).values());

  return (
    <div className="min-h-screen gym-bg flex flex-col">
      <HeaderGym />
      <Sidebar userRole={(localStorage.getItem('role') as "user" | "admin" | "trainer") || "user"} />
      
      <main className="flex-grow pt-24 px-6 pb-10">
        <div className="mx-auto w-full max-w-6xl">
          
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722] tracking-tight">Gestor de Entrenamiento</h1>
            <p className="text-gray-600 mt-1">Aquí puedes gestionar tus ejercicios y rutinas antes de añadirlos al calendario.</p>
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveTab("globales")}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === "globales" ? "bg-[#FF5722] text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
            >
              🌐 Entrenamientos Globales
            </button>
            <button 
              onClick={() => setActiveTab("personales")}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === "personales" ? "bg-[#FF5722] text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
            >
              🧑‍💻 Entrenamientos Personales
            </button>
            <button 
              onClick={() => setActiveTab("ejercicios")}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === "ejercicios" ? "bg-[#FF5722] text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"}`}
            >
              🏋️‍♂️ Tus Ejercicios
            </button>
          </div>

          {/* CONTENT: EJERCICIOS */}
          {activeTab === "ejercicios" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Librería de Ejercicios</h2>
                <button 
                  onClick={() => setIsExerciseModalOpen(true)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
                >
                  + Crear Ejercicio Personal
                </button>
              </div>
              {/* Subtabs globales/personales */}
              <div className="flex gap-3 mb-6">
                <button onClick={() => setExerciseSubTab("globales")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${exerciseSubTab === "globales" ? "bg-[#FF5722] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>🌐 Globales</button>
                <button onClick={() => setExerciseSubTab("personales")} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${exerciseSubTab === "personales" ? "bg-[#FF5722] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>🔒 Personales</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(exerciseSubTab === "globales" ? globalExercises : personalExercises).length === 0 ? (
                  <p className="text-gray-500 italic col-span-full">
                    {exerciseSubTab === "globales" ? "No hay ejercicios globales todavía (créalos como admin)." : "No tienes ejercicios personales todavía."}
                  </p>
                ) : (
                  (exerciseSubTab === "globales" ? globalExercises : personalExercises).map(ex => (
                    <div key={ex.id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative transition hover:shadow-md hover:border-[#FF5722]/50">
                      <span className="text-[#FF5722] font-bold text-lg mb-1 pr-6">{ex.name}</span>
                      <span className="text-gray-500 text-sm mb-2">Musculo: {ex.muscle || "General"}</span>
                      <span className="text-gray-400 text-xs bg-gray-50 p-2 rounded-lg mt-auto text-center border border-gray-100 truncate" title={ex.equipment}>
                        Equipo: {ex.equipment || "No especificado"}
                      </span>
                      {exerciseSubTab === "personales" && (
                        <button 
                          onClick={(e) => handleDeleteExercise(ex.id, e)}
                          className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition duration-200 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg"
                          title="Eliminar ejercicio"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CONTENT: ENTRENAMIENTOS (GLOBALES O PERSONALES) */}
          {(activeTab === "globales" || activeTab === "personales") && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTab === "globales" ? "Rutinas Globales" : "Tus Rutinas Personales"}
                </h2>
                {activeTab === "personales" && (
                  <button 
                    onClick={() => {
                      setRoutForm({ id: "", name: "", description: "", selectedExercises: [], targetUser: "", originalExercises: [] });
                      setIsRoutineModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-md"
                  >
                    + Crear Entrenamiento
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === "globales" ? globalRoutines : personalRoutines).length === 0 ? (
                  <p className="text-gray-500 italic col-span-full">
                    {activeTab === "globales" ? "No hay entrenamientos globales (créalos como admin)." : "No tienes entrenamientos personales todavía."}
                  </p>
                ) : (
                  (activeTab === "globales" ? globalRoutines : personalRoutines).map(routine => (
                    <div key={routine.id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#FF5722]/30 transition flex flex-col h-full relative">
                      {activeTab === "personales" && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                          <button 
                            onClick={(e) => handleOpenEdit(routine, e)}
                            className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-xl"
                            title="Editar entrenamiento"
                          >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={(e) => handleDeleteRoutine(routine.id, e)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-xl"
                            title="Eliminar entrenamiento"
                          >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF5722] mb-4">
                          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z"/></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 pr-8">{routine.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{routine.description}</p>
                        <div className="mb-6">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ejercicios de la Rutina</p>
                          <div className="flex flex-wrap gap-2">
                            {routine.exercises.map(ex => (
                              <span key={ex.id} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200">{ex.name}</span>
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Crear Ejercicio */}
        {isExerciseModalOpen && (
           <div className="fixed inset-0 z-50 flex justify-center items-center px-4 bg-gray-900/60 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-[#FF5722] mb-4">Añadir Nuevo Ejercicio</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                    <input type="text" value={exForm.name} onChange={e=>setExForm({...exForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#FF5722] font-semibold text-gray-800"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupo Muscular Principal</label>
                    <input type="text" value={exForm.muscle} onChange={e=>setExForm({...exForm, muscle: e.target.value})} placeholder="Ej: Espalda, Pecho, Piernas" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#FF5722] font-medium text-gray-800"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Material Requerido</label>
                    <input type="text" value={exForm.equipment} onChange={e=>setExForm({...exForm, equipment: e.target.value})} placeholder="Ej: Mancuernas, Máquina, Peso Corporal" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#FF5722] font-medium text-gray-800"/>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button onClick={handleSaveExercise} className="flex-1 bg-[#FF5722] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#F4511E] transition">Guardar</button>
                    <button onClick={() => setIsExerciseModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancelar</button>
                  </div>
                </div>
             </div>
           </div>
        )}

        {/* Modal Crear Entrenamiento */}
        {isRoutineModalOpen && (
           <div className="fixed inset-0 z-50 flex justify-center items-center px-4 bg-gray-900/60 backdrop-blur-sm">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-[#FF5722] mb-4">{routForm.id ? "Editar Entrenamiento" : "Crear Entrenamiento Personal"}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del entrenamiento</label>
                    <input type="text" value={routForm.name} onChange={e=>setRoutForm({...routForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-semibold text-gray-800" placeholder="Ej: Día de Fuerza en Pierna"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción corta</label>
                    <textarea value={routForm.description} onChange={e=>setRoutForm({...routForm, description: e.target.value})} rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800 resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selecciona los ejercicios incluidos</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[120px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200 custom-scrollbar">
                      {allExercisesForPicker.map(ex => {
                        const isSelected = routForm.selectedExercises.some(e => e.id === ex.id);
                        return (
                          <div 
                            key={ex.id} 
                            onClick={() => toggleSelectExerciseForRoutine(ex)}
                            className={`p-3 rounded-lg border cursor-pointer font-semibold text-sm transition-all ${isSelected ? "bg-[#FF5722] text-white border-[#FF5722] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
                          >
                            {isSelected && <span className="mr-2">✓</span>}
                            {ex.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Campo usuario destino (solo trainer/admin) */}
                  {canCreate && !routForm.id && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asignar a usuario (opcional)</label>
                      <input type="text" value={routForm.targetUser} onChange={e => setRoutForm({...routForm, targetUser: e.target.value})} placeholder="Username del usuario (dejar vacío para ti mismo)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800"/>
                      <p className="text-xs text-gray-400 mt-1">Si introduces un username, la rutina aparecerá en los personales de ese usuario.</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button onClick={handleSaveRoutine} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-gray-800 transition">{routForm.id ? "Guardar Cambios" : "Crear Entrenamiento"}</button>
                    <button onClick={() => { setIsRoutineModalOpen(false); setRoutForm({ id: "", name: "", description: "", selectedExercises: [], targetUser: "", originalExercises: [] }); }} className="py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">Cancelar</button>
                  </div>
                </div>
             </div>
           </div>
        )}

        {/* Modal de Asignación */}
        {isAssignModalOpen && selectedRoutine && (
          <div className="fixed inset-0 z-50 flex justify-center items-start pt-12 sm:pt-20 px-4 pb-4 overflow-y-auto bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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
              
              <div className="mb-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-center">
                <p className="text-[10px] font-bold text-orange-800/60 uppercase tracking-widest mb-1">Vas a realizar:</p>
                <p className="font-bold text-gray-800 text-lg">{selectedRoutine.name}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedRoutine.exercises.length} Ejercicios</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">¿Qué día quieres completarlo?</label>
                  <div 
                    onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition text-sm font-medium"
                  >
                    <span className={assignDate ? "text-gray-800 font-bold" : "text-gray-400"}>
                      {assignDate ? assignDate : "Desplegar para elegir fecha..."}
                    </span>
                    <svg className={`size-5 text-gray-400 transition-transform ${showCalendarDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  
                  {showCalendarDropdown && (
                    <div className="absolute top-[105%] left-0 w-full z-[60] animate-in slide-in-from-top-2 duration-200 shadow-2xl rounded-3xl pb-2 bg-white ring-1 ring-black/5">
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
                    Guardar / Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button 
            onClick={() => navigate('/dashboard')}
            className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95"
            title="Volver al Dashboard"
        >
            <svg className="w-7 h-7 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

      </main>
    </div>
  );
}
