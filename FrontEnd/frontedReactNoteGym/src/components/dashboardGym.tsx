import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { useSnack } from "@/components/SnackProvider"; // Retenido pero comentado en caso de usar notificaciones después
import { ContinuousCalendar } from "@/components/ContinuousCalendar";

interface DashboardGymProps {
  userRole?: "admin" | "user" | "trainer";
  userName?: string;
}

interface Note {
  id: string;
  title: string;
  body: string;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DashboardGym({ userRole: propsRole, userName: propsName }: DashboardGymProps) {
  // Lógica de rescate
  const userName = propsName || localStorage.getItem('username') || "Usuario de Prueba";
  const userRole = propsRole || (localStorage.getItem('role') as any) || "admin";

  const welcomeMessage = `👋 Bienvenid@ ${userName}`;

  // Estados del panel de día
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [assignedRoutines, setAssignedRoutines] = useState<Record<string, any[]>>({});
  
  const navigate = useNavigate();

  // Cargar datos del backend y localStorage al montar
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/notas', {
          headers: {
            'Authorization': `Bearer ${token}` // Añadir si en algún momento proteges la ruta
          }
        });
        if (res.ok) {
          const data = await res.json();
          const grouped: Record<string, Note[]> = {};
          data.forEach((backendNote: any) => {
             // Solo cargamos notas del usuario
             if (backendNote.user?.username !== username) return;
             
             const dateObj = new Date(backendNote.noteDate);
             const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
             
             if (!grouped[key]) grouped[key] = [];
             grouped[key].push({
               id: backendNote.id.toString(),
               title: backendNote.name,
               body: backendNote.text
             });
          });
          setNotes(grouped);
        } else {
            // Fallback
            const savedNotes = localStorage.getItem('user_notes');
            if (savedNotes) setNotes(JSON.parse(savedNotes));
        }
      } catch (err) {
        console.error("Error fetching notes", err);
        const savedNotes = localStorage.getItem('user_notes');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      }
    };
    
    fetchNotes();

    const savedRoutines = localStorage.getItem('user_assigned_routines');
    if (savedRoutines) setAssignedRoutines(JSON.parse(savedRoutines));
  }, []);

  // Estados para creación de nueva nota
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // Estados para modal de nota rápida
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const [quickNoteDate, setQuickNoteDate] = useState("");
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteBody, setQuickNoteBody] = useState("");
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  const handleDateClick = (day: number, month: number, year: number, createNote: boolean = false) => {
    setSelectedDate({ day, month, year });
    setIsCreatingNote(createNote); // Abre el formulario si createNote es true
    setNoteTitle("");
    setNoteBody("");
  };

  // Obtener notas del día seleccionado
  const dateKey = selectedDate ? `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}` : "";
  const currentNotes = selectedDate ? (notes[dateKey] || []) : [];

  const quickNoteDateFormatted = quickNoteDate ? (() => {
    const [y, m, d] = quickNoteDate.split("-");
    return `${parseInt(d, 10)} de ${monthNames[parseInt(m, 10) - 1]} de ${y}`;
  })() : "";

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteBody.trim() || !selectedDate) return;

    const username = localStorage.getItem('username') || "admin";
    const token = localStorage.getItem('token') || "";
    let realId = Date.now().toString();

    try {
      // Creamos la fecha a mediodía para evitar problemas de zona horaria al cargar
      const noteDate = new Date(Date.UTC(selectedDate.year, selectedDate.month, selectedDate.day, 12, 0, 0)).toISOString();
      const res = await fetch('http://localhost:8080/api/notas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: { username },
          name: noteTitle,
          text: noteBody,
          noteDate: noteDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        realId = data.id.toString();
      }
    } catch (e) {
      console.error("Backend no disponible, guardando localmente.", e);
    }

    const newNote: Note = {
      id: realId,
      title: noteTitle,
      body: noteBody,
    };

    const updatedNotes = {
      ...notes,
      [dateKey]: [...(notes[dateKey] || []), newNote]
    };
    
    setNotes(updatedNotes);
    localStorage.setItem('user_notes', JSON.stringify(updatedNotes));

    setIsCreatingNote(false);
    setNoteTitle("");
    setNoteBody("");
  };

  const handleSaveQuickNote = async () => {
    if (!quickNoteTitle.trim() || !quickNoteBody.trim() || !quickNoteDate) return;

    // Desglosar la fecha seleccionada (YYYY-MM-DD)
    const [yearStr, monthStr, dayStr] = quickNoteDate.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1; // 0-indexed para el diccionario
    const day = parseInt(dayStr, 10);

    const key = `${year}-${monthIndex}-${day}`;

    const username = localStorage.getItem('username') || "admin";
    const token = localStorage.getItem('token') || "";
    let realId = Date.now().toString();

    try {
      const noteDate = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)).toISOString();
      const res = await fetch('http://localhost:8080/api/notas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: { username },
          name: quickNoteTitle,
          text: quickNoteBody,
          noteDate: noteDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        realId = data.id.toString();
      }
    } catch (e) {
      console.error("Backend no disponible, guardando localmente.", e);
    }

    const newNote: Note = {
      id: realId,
      title: quickNoteTitle,
      body: quickNoteBody,
    };

    const updatedNotes = {
      ...notes,
      [key]: [...(notes[key] || []), newNote]
    };

    setNotes(updatedNotes);
    localStorage.setItem('user_notes', JSON.stringify(updatedNotes));

    // Cerrar y resetear
    setIsQuickNoteModalOpen(false);
    setQuickNoteTitle("");
    setQuickNoteBody("");
    setQuickNoteDate("");
  };

  const handleDeleteNote = async (dateKeyParam: string, noteId: string) => {
    if (!notes[dateKeyParam]) return;
    
    if (!window.confirm("¿Seguro que quieres eliminar esta nota?")) return;

    try {
      const token = localStorage.getItem('token') || "";
      await fetch(`http://localhost:8080/api/notas/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.error("No se pudo borrar del backend.", e);
    }

    const updatedNotesList = notes[dateKeyParam].filter(note => note.id !== noteId);
    
    const updatedNotes = {
      ...notes,
      [dateKeyParam]: updatedNotesList
    };
    
    setNotes(updatedNotes);
    localStorage.setItem('user_notes', JSON.stringify(updatedNotes));
  };

  const handleRemoveRoutine = (dateKeyParam: string, routineIndex: number) => {
    if (!assignedRoutines[dateKeyParam]) return;

    if (!window.confirm("¿Quitar esta rutina del día seleccionado?")) return;
    
    const updatedRoutinesList = assignedRoutines[dateKeyParam].filter((_, idx) => idx !== routineIndex);
    
    const updatedRoutines = {
      ...assignedRoutines,
      [dateKeyParam]: updatedRoutinesList
    };
    
    setAssignedRoutines(updatedRoutines);
    localStorage.setItem('user_assigned_routines', JSON.stringify(updatedRoutines));
  };

  return (
    <div className="mx-auto w-full max-w-6x2">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col gap-3 items-center text-center">
          <h1 className="text-4xl font-bold text-gray-800">{welcomeMessage}</h1>

          <p className="text-lg text-gray-600">
            Planifica entrenos, asigna rutinas y añade notas por día.
          </p>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setIsQuickNoteModalOpen(true);
                setShowCalendarDropdown(false);
              }}
              className="px-5 py-3 rounded-xl bg-[#FF5722] text-white font-semibold hover:bg-[#F4511E] transition hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              + Crear nota rápida
            </button>
            <button 
              onClick={() => navigate('/rutinas')}
              className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-md hover:-translate-y-0.5"
            >
              Ver rutinas
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-10 mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">

          {/* Calendario */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-[#FF5722] mb-4 text-center">
              Tu calendario de entrenamiento
            </h2>
            <ContinuousCalendar 
              onClick={handleDateClick} 
              dotsMap={useMemo(() => {
                const map: Record<string, { hasNote: boolean; hasRoutine: boolean }> = {};
                Object.keys(notes).forEach(k => {
                  if (notes[k].length > 0) map[k] = { hasNote: true, hasRoutine: false };
                });
                Object.keys(assignedRoutines).forEach(k => {
                  if (assignedRoutines[k].length > 0) {
                    if (!map[k]) map[k] = { hasNote: false, hasRoutine: true };
                    else map[k].hasRoutine = true;
                  }
                });
                return map;
              }, [notes, assignedRoutines])}
            />
          </div>

          {/* Panel del día */}
          <div className="lg:col-span-1 lg:mt-12 lg:-ml-11 lg:mr-12 transition-transform">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all h-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Panel del día
              </h3>

              {!selectedDate ? (
                <p className="text-gray-600 mb-4 h-full flex items-center justify-center p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  Selecciona un día en el calendario para ver sus detalles.
                </p>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm font-bold uppercase tracking-wider text-[#FF5722] mb-6 border-b border-gray-100 pb-2">
                    {selectedDate.day} de {monthNames[selectedDate.month]} de {selectedDate.year}
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Rutina Asignada</p>
                      {assignedRoutines[dateKey] && assignedRoutines[dateKey].length > 0 ? (
                        <div className="space-y-2">
                          {assignedRoutines[dateKey].map((rutina, idx) => (
                            <div key={idx} className="group bg-white p-3 rounded-lg border border-blue-100 shadow-sm relative pr-10">
                              <p className="text-blue-600 font-bold text-sm mb-1">{rutina.name}</p>
                              <p className="text-gray-500 text-xs">{rutina.exercises && rutina.exercises.length} ejercicios</p>
                              <button
                                onClick={() => handleRemoveRoutine(dateKey, idx)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF5722] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50"
                                title="Quitar rutina de este día"
                              >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 font-medium text-sm">
                          Ninguna rutina asignada.
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 block">Tus Notas</p>

                      {currentNotes.length === 0 ? (
                        <p className="text-gray-500 italic text-sm text-center py-4 bg-gray-50 rounded-lg">
                          No hay notas en este día.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {currentNotes.map(note => (
                            <details key={note.id} className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden text-sm transition-all shadow-sm">
                              <summary className="font-semibold text-gray-800 cursor-pointer p-3 hover:bg-gray-100 transition flex items-center justify-between">
                                <span className="flex-1 truncate pr-2">{note.title}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteNote(dateKey, note.id);
                                    }}
                                    className="text-[#FF5722] hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                    title="Eliminar nota"
                                  >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                  <span className="opacity-50 group-open:rotate-180 transition-transform pl-1">▼</span>
                                </div>
                              </summary>
                              <div className="p-3 text-gray-600 border-t border-gray-200 bg-white leading-relaxed whitespace-pre-wrap">
                                {note.body}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isCreatingNote ? (
                      <button
                        onClick={() => setIsCreatingNote(true)}
                        className="w-full mt-2 px-4 py-3 rounded-xl bg-[#FF5722] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#F4511E] transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Añadir nota
                      </button>
                    ) : (
                      <div className="rounded-xl border-2 border-orange-100 bg-orange-50/40 p-5 mt-2 space-y-4 animate-in zoom-in-95 duration-200 shadow-inner">
                        <div>
                          <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1.5 pl-1">Título de la nota</label>
                          <input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Ej: Día de pierna"
                            autoFocus
                            className="w-full px-4 py-2.5 rounded-lg border border-orange-200 bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 outline-none transition text-sm text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1.5 pl-1">Cuerpo / Detalles</label>
                          <textarea
                            value={noteBody}
                            onChange={(e) => setNoteBody(e.target.value)}
                            placeholder="Escribe los ejercicios, pesos o sensaciones aquí..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-orange-200 bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 outline-none transition text-sm resize-none text-gray-800 placeholder:text-gray-400"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSaveNote}
                            disabled={!noteTitle.trim() || !noteBody.trim()}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 disabled:hover:bg-gray-900 disabled:cursor-not-allowed shadow-md"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setIsCreatingNote(false)}
                            className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
                          >
                            Cancelar
                          </button>
                        </div>
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

        {/* Bottom cards */}
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

      {/* Modal de nota rápida */}
      {isQuickNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-12 sm:pt-20 px-4 pb-4 overflow-y-auto bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 mb-12 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-[#FF5722] tracking-tight">Crear nota rápida</h3>
              <button
                onClick={() => setIsQuickNoteModalOpen(false)}
                className="text-gray-400 hover:text-[#FF5722] transition bg-gray-50 hover:bg-orange-50 p-2.5 rounded-xl"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Seleccionar Fecha</label>
                <div
                  onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition text-sm font-medium"
                >
                  <span className={quickNoteDate ? "text-gray-800" : "text-gray-400"}>
                    {quickNoteDate ? quickNoteDateFormatted : "Elige un día en el calendario..."}
                  </span>
                  <svg className="size-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>

                {showCalendarDropdown && (
                  <div className="absolute top-[105%] left-0 w-full z-[60] animate-in slide-in-from-top-2 duration-200 shadow-2xl rounded-3xl pb-2">
                    <ContinuousCalendar
                      onClick={(day, month, year) => {
                        setQuickNoteDate(`${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                        setShowCalendarDropdown(false);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Título de la nota</label>
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder="Ej: Día de pierna, Nutrición, etc."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 outline-none transition text-sm text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Cuerpo / Detalles</label>
                <textarea
                  value={quickNoteBody}
                  onChange={(e) => setQuickNoteBody(e.target.value)}
                  placeholder="Escribe los detalles y notas aquí..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#FF5722] focus:ring-2 focus:ring-[#FF5722]/20 outline-none transition text-sm resize-none text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveQuickNote}
                  disabled={!quickNoteDate || !quickNoteTitle.trim() || !quickNoteBody.trim()}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#FF5722] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#F4511E] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm uppercase tracking-widest"
                >
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DashboardCard = ({ title, content }: { title: string; content: string }) => (
  <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">
    <h3 className="text-xl font-semibold text-[#FF5722] mb-2">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </div>
);