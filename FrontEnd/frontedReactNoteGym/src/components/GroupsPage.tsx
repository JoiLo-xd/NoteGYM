import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from './headerGym';
import Sidebar from './Sidebar';
import { apiService } from '../services/api';
import type { Exercise, Workout, Group, User } from '../services/api';
import { useSnack } from '../context/SnackContext';

export default function GroupsPage() {
    const navigate = useNavigate();
    const { createSnack } = useSnack();
    const role = localStorage.getItem('role');

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [trainerNameInput, setTrainerNameInput] = useState('');
    
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    // Modals state
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [groupUsers, setGroupUsers] = useState<User[]>([]);

    const [showExModal, setShowExModal] = useState(false);
    const [exForm, setExForm] = useState({ name: '', type: '', description: '' });

    const [showWkModal, setShowWkModal] = useState(false);
    const [wkForm, setWkForm] = useState({ name: '', description: '', selectedExercises: [] as Exercise[] });

    const [showEditWkModal, setShowEditWkModal] = useState(false);
    const [editWkId, setEditWkId] = useState<number | null>(null);
    const [editWkForm, setEditWkForm] = useState({ name: '', description: '', selectedExercises: [] as Exercise[], originalExercises: [] as Exercise[] });

    useEffect(() => {
        fetchMyGroup();
    }, []);

    const fetchMyGroup = async () => {
        try {
            const data = await apiService.getMyGroup();
            setGroup(data);
            if (data && data.name) {
                // El name del grupo es el trainerName
                fetchTrainerContent(data.name);
            }
        } catch {
            setGroup(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainerContent = async (trainerName: string) => {
        try {
            const [exData, wkData] = await Promise.all([
                apiService.getTrainerExercises(trainerName),
                apiService.getTrainerWorkouts(trainerName)
            ]);
            setExercises(exData);
            setWorkouts(wkData);
        } catch {
            createSnack("Error cargando el contenido del entrenador", "error");
        }
    };

    const handleCreateGroup = async () => {
        try {
            const data = await apiService.createGroup();
            setGroup(data);
            createSnack("Grupo creado exitosamente", "success");
            fetchTrainerContent(data.name);
        } catch (err) {
            createSnack((err as Error).message || "Error al crear grupo", "error");
        }
    };

    const handleJoinGroup = async () => {
        if (!trainerNameInput.trim()) return;
        try {
            const data = await apiService.joinGroup(trainerNameInput.trim());
            setGroup(data);
            createSnack(`Te has unido al grupo de ${data.name}`, "success");
            fetchTrainerContent(data.name);
        } catch (err) {
            createSnack((err as Error).message || "Error al unirse al grupo", "error");
        }
    };

    const handleViewUsers = async () => {
        try {
            const users = await apiService.getMyGroupUsers();
            setGroupUsers(users);
            setShowUsersModal(true);
        } catch {
            createSnack("Error cargando alumnos", "error");
        }
    };

    const handleAddExercise = async () => {
        if (!exForm.name) return;
        try {
            await apiService.createExercise({
                name: exForm.name,
                type: exForm.type,
                description: exForm.description,
                videoUrl: '', imagePath: '', durationTime: 0
            });
            createSnack("Ejercicio añadido al grupo", "success");
            setShowExModal(false);
            setExForm({ name: '', type: '', description: '' });
            if (group) fetchTrainerContent(group.name);
        } catch {
            createSnack("Error al crear ejercicio", "error");
        }
    };

    const handleAddWorkout = async () => {
        if (!wkForm.name) return;
        try {
            const savedWorkout = await apiService.createWorkout({
                name: wkForm.name,
                description: wkForm.description,
                exercises: []
            });
            // Añadir ejercicios seleccionados al workout recién creado
            if (savedWorkout.id && wkForm.selectedExercises.length > 0) {
                for (const ex of wkForm.selectedExercises) {
                    await apiService.addExerciseToWorkout(savedWorkout.id, ex.id!);
                }
            }
            createSnack(`Entrenamiento creado con ${wkForm.selectedExercises.length} ejercicio(s)`, "success");
            setShowWkModal(false);
            setWkForm({ name: '', description: '', selectedExercises: [] });
            if (group) fetchTrainerContent(group.name);
        } catch {
            createSnack("Error al crear entrenamiento", "error");
        }
    };

    const handleOpenEditWorkout = (w: Workout) => {
        setEditWkId(w.id!);
        setEditWkForm({
            name: w.name,
            description: w.description,
            selectedExercises: [...(w.exercises || [])],
            originalExercises: [...(w.exercises || [])],
        });
        setShowEditWkModal(true);
    };

    const handleSaveEditWorkout = async () => {
        if (!editWkId || !editWkForm.name) return;
        try {
            await apiService.updateWorkout(editWkId, { name: editWkForm.name, description: editWkForm.description, exercises: [] });
            const origIds = editWkForm.originalExercises.map(e => String(e.id));
            const selIds  = editWkForm.selectedExercises.map(e => String(e.id));
            for (const ex of editWkForm.selectedExercises) {
                if (!origIds.includes(String(ex.id))) await apiService.addExerciseToWorkout(editWkId, ex.id!);
            }
            for (const ex of editWkForm.originalExercises) {
                if (!selIds.includes(String(ex.id))) await apiService.removeExerciseFromWorkout(editWkId, ex.id!);
            }
            createSnack("Entrenamiento actualizado", "success");
            setShowEditWkModal(false);
            if (group) fetchTrainerContent(group.name);
        } catch {
            createSnack("Error al actualizar el entrenamiento", "error");
        }
    };

    const handleDeleteWorkout = async (id: number) => {
        if (!window.confirm("¿Eliminar este entrenamiento del grupo?")) return;
        try {
            await apiService.deleteWorkout(id);
            createSnack("Entrenamiento eliminado", "success");
            if (group) fetchTrainerContent(group.name);
        } catch {
            createSnack("Error al eliminar el entrenamiento", "error");
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("¿Seguro que quieres salir de este grupo?")) return;
        try {
            await apiService.leaveGroup();
            createSnack("Has salido del grupo correctamente", "success");
            setGroup(null);
            setExercises([]);
            setWorkouts([]);
        } catch (err) {
            createSnack((err as Error).message || "Error al salir", "error");
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("¿Seguro que quieres eliminar tu grupo? Se expulsará a todos los alumnos.")) return;
        try {
            await apiService.deleteGroup();
            createSnack("Grupo eliminado correctamente", "success");
            setGroup(null);
            setExercises([]);
            setWorkouts([]);
        } catch (err) {
            createSnack((err as Error).message || "Error al eliminar grupo", "error");
        }
    };

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole={(role as 'admin' | 'user' | 'trainer') || "user"} />
            <main className="flex-grow pt-24 px-6 pb-10">
                <div className="mx-auto w-full max-w-5xl">
                    
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722]">Grupos de Entrenamiento</h1>
                            <p className="text-gray-600 mt-1">Conecta con tu entrenador y accede a su contenido exclusivo.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF5722] border-t-transparent"></div>
                        </div>
                    ) : !group ? (
                        /* ESTADO: NO TIENE GRUPO */
                        <div className="bg-white rounded-3xl shadow-md p-8 text-center max-w-xl mx-auto border border-gray-100">
                            <div className="size-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="size-10 text-[#FF5722]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Aún no estás en ningún grupo</h2>
                            
                            {role === 'trainer' || role === 'admin' ? (
                                <div>
                                    <p className="text-gray-500 mb-6">Como entrenador, puedes crear tu propio grupo para que tus alumnos se unan a ti y vean tus rutinas y ejercicios.</p>
                                    <button 
                                        onClick={handleCreateGroup}
                                        className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl transition shadow-md"
                                    >
                                        Crear mi Grupo
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-500 mb-6">Introduce el nombre de usuario de tu entrenador para unirte a su grupo.</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={trainerNameInput}
                                            onChange={e => setTrainerNameInput(e.target.value)}
                                            placeholder="Username del entrenador" 
                                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800"
                                        />
                                        <button 
                                            onClick={handleJoinGroup}
                                            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition shadow-md"
                                        >
                                            Unirme
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ESTADO: YA TIENE GRUPO */
                        <div className="space-y-8">
                            <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                                <div className="size-16 bg-[#FF5722] rounded-full flex items-center justify-center shadow-inner">
                                    <svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-orange-900">{group.description || group.name}</h2>
                                    <p className="text-orange-700/80 font-medium text-sm">
                                        {role === 'trainer' ? 'Has creado este grupo y tus alumnos pueden unirse buscando tu username.' : `Estás suscrito al contenido de ${group.name}.`}
                                    </p>
                                </div>
                                {role === 'trainer' ? (
                                    <div className="ml-auto flex flex-wrap gap-2">
                                        <button onClick={handleViewUsers} className="px-4 py-2 bg-orange-900 hover:bg-orange-800 text-white rounded-lg text-sm font-bold shadow-sm transition">
                                            👥 Ver Alumnos
                                        </button>
                                        <button onClick={() => setShowExModal(true)} className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg text-sm font-bold shadow-sm transition">
                                            + Ejercicio
                                        </button>
                                        <button onClick={() => setShowWkModal(true)} className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg text-sm font-bold shadow-sm transition">
                                            + Entrenamiento
                                        </button>
                                        <button onClick={handleDeleteGroup} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm transition">
                                            🗑 Eliminar Grupo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="ml-auto flex flex-wrap gap-2">
                                        <button onClick={handleLeaveGroup} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-sm transition">
                                            🚪 Salir del Grupo
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Entrenamientos del Entrenador */}
                                <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                        <span className="text-2xl">🔥</span>
                                        <h3 className="text-xl font-bold text-gray-800">Entrenamientos</h3>
                                    </div>
                                    
                                    {workouts.length === 0 ? (
                                        <p className="text-gray-400 italic text-sm text-center py-6">El entrenador aún no ha publicado entrenamientos.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {workouts.map(w => (
                                                <div key={w.id} className="relative p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#FF5722] transition group">
                                                    {role === 'trainer' && (
                                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                            <button
                                                                onClick={() => handleOpenEditWorkout(w)}
                                                                className="p-1.5 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                                                                title="Editar"
                                                            >
                                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteWorkout(w.id!)}
                                                                className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                                                                title="Eliminar"
                                                            >
                                                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                    <h4 className="font-bold text-gray-900 text-lg pr-16">{w.name}</h4>
                                                    {w.description && <p className="text-sm text-gray-600 mt-1">{w.description}</p>}
                                                    <div className="mt-3 flex gap-2 flex-wrap">
                                                        {w.exercises?.map(ex => (
                                                            <span key={ex.id} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 font-medium">
                                                                {ex.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {role !== 'trainer' && (
                                                        <button
                                                            onClick={() => navigate('/entrenar', { state: { workout: w } })}
                                                            className="mt-4 w-full py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl text-sm transition shadow-sm hover:-translate-y-0.5"
                                                        >
                                                            🏋️‍♂️ Hacer Ejercicio
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Ejercicios del Entrenador */}
                                <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                        <span className="text-2xl">💪</span>
                                        <h3 className="text-xl font-bold text-gray-800">Ejercicios</h3>
                                    </div>
                                    
                                    {exercises.length === 0 ? (
                                        <p className="text-gray-400 italic text-sm text-center py-6">El entrenador aún no ha publicado ejercicios.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {exercises.map(e => (
                                                <div key={e.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#FF5722] transition flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm truncate" title={e.name}>{e.name}</h4>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5722]">{e.type}</span>
                                                    </div>
                                                    {e.videoUrl && (
                                                        <a href={e.videoUrl} target="_blank" rel="noreferrer" className="mt-2 text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                                                            <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            Ver Video
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL ALUMNOS */}
                {showUsersModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setShowUsersModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                                ✖
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Mis Alumnos</h3>
                            {groupUsers.length === 0 ? (
                                <p className="text-gray-500 italic">Aún no se ha unido nadie a tu grupo.</p>
                            ) : (
                                <ul className="space-y-3 max-h-96 overflow-y-auto">
                                    {groupUsers.map(u => (
                                        <li key={u.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                            <div className="size-10 bg-orange-100 text-[#FF5722] rounded-full flex items-center justify-center font-bold uppercase">
                                                {u.username.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{u.username}</p>
                                                <p className="text-xs text-gray-500">{u.mail}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL EJERCICIO */}
                {showExModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                            <button onClick={() => setShowExModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                                ✖
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Añadir Ejercicio al Grupo</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nombre del ejercicio" value={exForm.name} onChange={e => setExForm({...exForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722]" />
                                <input type="text" placeholder="Tipo (ej: Pecho, Pierna)" value={exForm.type} onChange={e => setExForm({...exForm, type: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722]" />
                                <input type="text" placeholder="Equipamiento / Descripción" value={exForm.description} onChange={e => setExForm({...exForm, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722]" />
                                <button onClick={handleAddExercise} className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl shadow-md">
                                    Guardar Ejercicio
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL ENTRENAMIENTO */}
                {showWkModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <button onClick={() => { setShowWkModal(false); setWkForm({ name: '', description: '', selectedExercises: [] }); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                                ✖
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Añadir Entrenamiento al Grupo</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del entrenamiento</label>
                                    <input type="text" placeholder="Ej: Día de Fuerza en Pierna" value={wkForm.name} onChange={e => setWkForm({...wkForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-semibold text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                                    <textarea placeholder="Descripción del entrenamiento" value={wkForm.description} onChange={e => setWkForm({...wkForm, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] min-h-[80px] resize-none font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ejercicios incluidos</label>
                                    {exercises.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            No tienes ejercicios creados todavía. Crea ejercicios primero con el botón "+ Ejercicio".
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                                            {exercises.map(ex => {
                                                const isSelected = wkForm.selectedExercises.some(e => e.id === ex.id);
                                                return (
                                                    <div
                                                        key={ex.id}
                                                        onClick={() => setWkForm(prev => {
                                                            const exists = prev.selectedExercises.some(e => e.id === ex.id);
                                                            return {
                                                                ...prev,
                                                                selectedExercises: exists
                                                                    ? prev.selectedExercises.filter(e => e.id !== ex.id)
                                                                    : [...prev.selectedExercises, ex]
                                                            };
                                                        })}
                                                        className={`p-2.5 rounded-lg border cursor-pointer font-semibold text-sm transition-all select-none ${
                                                            isSelected
                                                                ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-sm'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF5722]/50'
                                                        }`}
                                                    >
                                                        {isSelected && <span className="mr-1">✓</span>}
                                                        <span className="truncate block">{ex.name}</span>
                                                        {ex.type && <span className="text-[10px] opacity-70 block">{ex.type}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {wkForm.selectedExercises.length > 0 && (
                                        <p className="text-xs text-[#FF5722] font-bold mt-1 ml-1">
                                            {wkForm.selectedExercises.length} ejercicio(s) seleccionado(s)
                                        </p>
                                    )}
                                </div>
                                <button onClick={handleAddWorkout} className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl shadow-md transition">
                                    Guardar Entrenamiento
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL EDITAR ENTRENAMIENTO */}
                {showEditWkModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setShowEditWkModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✖</button>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Editar Entrenamiento</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                                    <input type="text" value={editWkForm.name} onChange={e => setEditWkForm({...editWkForm, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-semibold text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                                    <textarea value={editWkForm.description} onChange={e => setEditWkForm({...editWkForm, description: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] min-h-[80px] resize-none font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ejercicios</label>
                                    {exercises.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-200">No hay ejercicios disponibles.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                                            {exercises.map(ex => {
                                                const isSel = editWkForm.selectedExercises.some(e => String(e.id) === String(ex.id));
                                                return (
                                                    <div
                                                        key={ex.id}
                                                        onClick={() => setEditWkForm(prev => {
                                                            const exists = prev.selectedExercises.some(e => String(e.id) === String(ex.id));
                                                            return { ...prev, selectedExercises: exists ? prev.selectedExercises.filter(e => String(e.id) !== String(ex.id)) : [...prev.selectedExercises, ex] };
                                                        })}
                                                        className={`p-2.5 rounded-lg border cursor-pointer font-semibold text-sm transition-all select-none ${isSel ? 'bg-[#FF5722] text-white border-[#FF5722]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#FF5722]/50'}`}
                                                    >
                                                        {isSel && <span className="mr-1">✓</span>}
                                                        <span className="truncate block">{ex.name}</span>
                                                        {ex.type && <span className="text-[10px] opacity-70 block">{ex.type}</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {editWkForm.selectedExercises.length > 0 && (
                                        <p className="text-xs text-[#FF5722] font-bold mt-1 ml-1">{editWkForm.selectedExercises.length} ejercicio(s) seleccionado(s)</p>
                                    )}
                                </div>
                                <button onClick={handleSaveEditWorkout} className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl shadow-md transition">
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
