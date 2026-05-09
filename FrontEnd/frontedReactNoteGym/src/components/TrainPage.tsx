import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderGym from "./headerGym";
import Sidebar from "./Sidebar";
import { apiService } from "../services/api";
import type { Exercise as ApiExercise, Workout } from "../services/api";

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

export default function TrainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allRoutines, setAllRoutines] = useState<Routine[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [globalWorkouts, personalWorkouts] = await Promise.all([
          apiService.getGlobalWorkouts(),
          apiService.getPersonalWorkouts(),
        ]);
        const mapped = [
          ...globalWorkouts.map(w => ({ ...mapApiWorkout(w), isGlobal: true })),
          ...personalWorkouts.map(w => ({ ...mapApiWorkout(w), isGlobal: false })),
        ];
        setAllRoutines(mapped);
      } catch (err) {
        console.error("Error cargando rutinas:", err);
      }
    };
    loadData();
  }, []);
  const [todayRoutines] = useState<Routine[]>(() => {
    const savedAssigned = localStorage.getItem("user_assigned_routines");
    if (savedAssigned) {
      const assigned = JSON.parse(savedAssigned);
      const d = new Date();
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return assigned[key] || [];
    }
    return [];
  });
  const [searchFilter, setSearchFilter] = useState("");

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(() => {
    const state = location.state as { workout?: Workout } | null;
    if (state && state.workout) {
      return mapApiWorkout(state.workout);
    }
    return null;
  });
  
  // Trainer state
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [sets, setSets] = useState(3);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(10);
  
  // Timer state
  const [workTime, setWorkTime] = useState(60); // in seconds
  const [useTimer, setUseTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isResting, setIsResting] = useState(false);

  // Audio mock
  const playAlarm = useCallback(() => {
    console.log("BEEP! Time is up!");
  }, []);

  const resetExSettings = useCallback(() => {
    setSets(3);
    setCurrentSet(1);
    setReps(10);
    setWorkTime(60);
    setUseTimer(false);
    setTimeLeft(60);
    setTimerActive(false);
    setIsResting(false);
  }, []);

  const handleNextExercise = useCallback(() => {
    if (selectedRoutine && currentExIndex < selectedRoutine.exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      resetExSettings();
    } else {
      alert("¡Entrenamiento Completado! Excelente trabajo 🏆");
      setSelectedRoutine(null);
    }
  }, [selectedRoutine, currentExIndex, resetExSettings]);



  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      timeout = setTimeout(() => {
        setTimerActive(false);
        playAlarm();

        if (!isResting) {
          setIsResting(true);
          setTimeLeft(Math.floor(workTime / 2));
        } else {
          if (currentSet < sets) {
            setIsResting(false);
            setCurrentSet(prev => prev + 1);
            setTimeLeft(workTime);
          } else {
            handleNextExercise();
          }
        }
      }, 0);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [timerActive, timeLeft, isResting, currentSet, sets, workTime, playAlarm, handleNextExercise]);

  const handleStartRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setCurrentExIndex(0);
    resetExSettings();
  };

  useEffect(() => {
    const state = location.state as { workout?: Workout } | null;
    if (state && state.workout) {
      // Limpiamos el estado para no repetir la acción al recargar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const formattedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtrado
  const displayedRoutines = allRoutines.filter(r => r.name.toLowerCase().includes(searchFilter.toLowerCase()));

  // Render View Selection
  if (!selectedRoutine) {
    return (
      <div className="min-h-screen gym-bg flex flex-col">
        <HeaderGym />
        <Sidebar userRole={(localStorage.getItem('role') as 'admin' | 'user' | 'trainer') || "user"} />
        <main className="flex-grow pt-24 px-6 pb-10">
          <div className="mx-auto w-full max-w-4xl">
            
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722] tracking-tight">Modo Entrenamiento</h1>
                <p className="text-gray-600 mt-1">Selecciona una rutina para iniciar.</p>
              </div>
              <input 
                type="text"
                placeholder="🔎 Filtrar rutina..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#FF5722]"
              />
            </div>

            {todayRoutines.length > 0 && searchFilter === "" && (
              <div className="mb-10">
                <h2 className="text-xl font-bold bg-[#FF5722] text-white px-4 py-2 rounded-lg inline-block mb-4 shadow-md">🔥 Tus Tareas de Hoy 👇</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayRoutines.map(routine => (
                    <div key={routine.id} className="bg-orange-50 border-2 border-orange-200 p-5 rounded-2xl flex flex-col items-start gap-3 shadow-sm hover:shadow-md transition">
                      <h3 className="font-bold text-gray-800 text-lg">{routine.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{routine.description}</p>
                      <button 
                        onClick={() => handleStartRoutine(routine)}
                        className="mt-2 text-white bg-[#FF5722] hover:bg-[#F4511E] px-4 py-2 rounded-xl font-bold transition w-full shadow-md hover:-translate-y-0.5"
                      >
                        ⚡ INICIAR
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Librería Completa</h2>
              {displayedRoutines.length === 0 ? (
                <p className="text-gray-500 italic">No se ha encontrado ninguna rutina.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedRoutines.map(routine => (
                    <div key={routine.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-start gap-2 shadow-sm hover:shadow-md transition">
                      <h3 className="font-bold text-gray-800">{routine.name} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-normal ml-2">{routine.isGlobal ? 'Global' : 'Personal'}</span></h3>
                      <p className="text-gray-500 text-xs mb-2">{routine.exercises.length} Ejercicios</p>
                      <button 
                        onClick={() => handleStartRoutine(routine)}
                        className="mt-auto text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold transition w-full"
                      >
                        Seleccionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Botón Flotante Volver */}
        <button 
            onClick={() => navigate('/dashboard')}
            className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-[0_4px_20px_0_rgba(255,87,34,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_0_rgba(255,87,34,0.5)] z-40 group flex items-center justify-center transform active:scale-95"
            title="Volver al Dashboard"
        >
            <svg className="w-7 h-7 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

      </div>
    );
  }

  // --- TRAINER ACTIVE VIEW ---
  const currentEx = selectedRoutine.exercises[currentExIndex];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white pb-20">
      <div className="bg-black/40 p-4 border-b border-gray-800 flex justify-between items-center fixed top-0 w-full z-10 backdrop-blur-sm">
        <h2 className="font-bold text-gray-300 truncate"><span className="text-[#FF5722]">{selectedRoutine.name}</span> • Ejercicio {currentExIndex + 1}/{selectedRoutine.exercises.length}</h2>
        <button onClick={() => {
            if(window.confirm("¿Seguro que quieres salir de la sesión actual?")) setSelectedRoutine(null);
          }} 
          className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-sm font-bold hover:bg-red-500/40 transition"
        >
          Abandonar
        </button>
      </div>

      <main className="flex-grow pt-24 px-6 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {/* EXERCISE INFO */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-wide">{currentEx.name}</h1>
          <p className="text-gray-400 font-medium">Musculo: <span className="text-gray-300">{currentEx.muscle}</span> | Equipamiento: <span className="text-gray-300">{currentEx.equipment}</span></p>
        </div>

        {/* CONTROLS */}
        <div className="bg-gray-800/50 border border-gray-700 w-full rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm mb-6">
          <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
            <label className="font-bold text-gray-300 text-lg flex items-center gap-2">
              ⏱️ Usar Timer
              <input type="checkbox" checked={useTimer} onChange={e => {
                setUseTimer(e.target.checked);
                setTimerActive(false);
                setTimeLeft(workTime);
                setIsResting(false);
              }} className="w-5 h-5 accent-[#FF5722]" />
            </label>
            <div className="text-right">
              <p className="text-[#FF5722] font-black text-xl">Serie {currentSet} / {sets}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-400 font-bold tracking-widest pl-1">Series Totales</label>
              <input type="number" min="1" value={sets} onChange={e => setSets(parseInt(e.target.value) || 1)} disabled={useTimer && timerActive} className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] font-semibold text-lg disabled:opacity-50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-400 font-bold tracking-widest pl-1">Repeticiones</label>
              <input type="number" min="1" value={reps} onChange={e => setReps(parseInt(e.target.value) || 1)} disabled={useTimer && timerActive} className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] font-semibold text-lg disabled:opacity-50" />
            </div>
            
            {useTimer && (
              <div className="col-span-2 flex flex-col gap-1 mt-2">
                <label className="text-xs uppercase text-gray-400 font-bold tracking-widest pl-1">Segundos de trabajo (El descanso será la mitad)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="10" value={workTime} onChange={e => {
                    const v = parseInt(e.target.value) || 10;
                    setWorkTime(v);
                    if(!timerActive && !isResting) setTimeLeft(v);
                  }} disabled={timerActive} className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] font-semibold text-lg disabled:opacity-50 flex-1" />
                  <span className="text-gray-400 font-bold">SEG</span>
                </div>
              </div>
            )}
          </div>

          {/* TIMER DISPLAY */}
          {useTimer && (
            <div className="text-center bg-gray-900/60 rounded-3xl py-10 px-4 border border-gray-800 mb-6 relative overflow-hidden">
               {isResting && (
                 <div className="absolute top-0 right-0 left-0 bg-blue-600 text-white font-bold text-xs py-1 tracking-widest uppercase">Descanso</div>
               )}
               {!isResting && timerActive && (
                 <div className="absolute top-0 right-0 left-0 bg-[#FF5722] text-white font-bold text-xs py-1 tracking-widest uppercase">Trabajo Activo</div>
               )}
              
               <div className={`font-black text-7xl sm:text-8xl tabular-nums tracking-tighter ${isResting ? 'text-blue-400' : (timerActive ? 'text-[#FF5722]' : 'text-white')}`}>
                 {formattedTime(timeLeft)}
               </div>
               
               <div className="flex gap-3 mt-8 justify-center">
                 {!timerActive && timeLeft === workTime && !isResting && (
                   <button onClick={() => setTimerActive(true)} className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-8 py-3 rounded-xl font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(255,87,34,0.4)] transition">
                     ▶ Iniciar
                   </button>
                 )}

                 {timerActive && (
                   <button onClick={() => setTimerActive(false)} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-8 py-3 rounded-xl font-bold tracking-wider uppercase transition">
                     ⏸ Pausar
                   </button>
                 )}

                 {!timerActive && (timeLeft < workTime || isResting) && (
                   <button onClick={() => setTimerActive(true)} className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl font-bold tracking-wider uppercase transition">
                     ▶ Reanudar
                   </button>
                 )}

                 {(timeLeft < workTime || isResting) && (
                   <button onClick={() => {
                     setTimerActive(false);
                     setIsResting(false);
                     setTimeLeft(workTime);
                   }} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold tracking-wider uppercase transition">
                     ⏹ Reiniciar
                   </button>
                 )}
               </div>

               {isResting && !timerActive && (
                 <p className="text-gray-400 text-sm mt-4 italic blink">Haz clic en <strong>Reanudar</strong> para contar tu descanso.</p>
               )}
            </div>
          )}

          {!useTimer && (
             <div className="text-center mt-6 pt-6 border-t border-gray-700">
               <button onClick={() => {
                 if(currentSet < sets) {
                   setCurrentSet(s => s + 1);
                 } else {
                   handleNextExercise();
                 }
               }} className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-8 py-4 rounded-2xl w-full font-black text-xl tracking-wider uppercase shadow-[0_4px_20px_rgba(255,87,34,0.4)] transition hover:-translate-y-1">
                 {currentSet < sets ? `✅ Terminar Serie ${currentSet} (Siguiente)` : `⏭ Pasar al Siguiente Ejercicio`}
               </button>
             </div>
          )}
        </div>
        
        {/* GLOBAL SKIP FOR TIMER MODE */}
        {useTimer && (
          <button onClick={handleNextExercise} className="text-gray-500 hover:text-white font-semibold underline underline-offset-4 decoration-gray-600 transition tracking-wide text-sm mb-6">
            Saltar ejercicio ⏭
          </button>
        )}

      </main>
    </div>
  );
}
