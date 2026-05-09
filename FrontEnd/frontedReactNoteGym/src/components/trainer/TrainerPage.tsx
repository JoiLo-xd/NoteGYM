import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderGym from '../headerGym';
import Sidebar from '../Sidebar';
import { apiService } from '../../services/api';
import { useSnack } from '../../context/SnackContext';

export default function TrainerPage() {
    const navigate = useNavigate();
    const { createSnack } = useSnack();

    // Crear entrenamiento para usuario
    const [wForm, setWForm] = useState({ targetUser: '', name: '', description: '', selectedExercises: [] as any[] });
    const [wStatus, setWStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [wMsg, setWMsg] = useState('');

    const [allExercises, setAllExercises] = useState<any[]>([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const [gEx, pEx] = await Promise.all([
                    apiService.getGlobalExercises(),
                    apiService.getPersonalExercises()
                ]);
                const mapApiExercise = (ex: any) => ({
                    id: String(ex.id),
                    name: ex.name,
                    muscle: ex.type || "",
                    equipment: ex.description || ""
                });
                const combined = Array.from(new Map([...gEx.map(mapApiExercise), ...pEx.map(mapApiExercise)].map(ex => [ex.id, ex])).values());
                setAllExercises(combined);
            } catch (err) {
                console.error("Error fetching exercises", err);
            }
        };
        fetchExercises();
    }, []);

    // Crear ejercicio para usuario
    const [eForm, setEForm] = useState({ targetUser: '', name: '', muscle: '', equipment: '' });
    const [eStatus, setEStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [eMsg, setEMsg] = useState('');


    const handleCreateWorkout = async () => {
        if (!wForm.targetUser.trim() || !wForm.name.trim()) {
            setWMsg('Introduce el username y nombre del entrenamiento.');
            setWStatus('error');
            return;
        }
        setWStatus('loading');
        try {
            const savedWorkout = await apiService.createWorkoutForUser(wForm.targetUser.trim(), {
                name: wForm.name, description: wForm.description, exercises: []
            });
            for (const ex of wForm.selectedExercises) {
                if (savedWorkout.id) {
                    await apiService.addExerciseToWorkout(savedWorkout.id, ex.id);
                }
            }
            setWStatus('success');
            setWMsg(`✅ Entrenamiento "${wForm.name}" creado para ${wForm.targetUser}`);
            setWForm({ targetUser: '', name: '', description: '', selectedExercises: [] });
            createSnack(`Entrenamiento asignado a ${wForm.targetUser}`, 'success');
        } catch (err) {
            setWStatus('error');
            setWMsg(`Error: ${(err as Error).message || 'Error desconocido al crear el entrenamiento.'}`);
        }
    };

    const handleCreateExercise = async () => {
        if (!eForm.targetUser.trim() || !eForm.name.trim()) {
            setEMsg('Introduce el username y nombre del ejercicio.');
            setEStatus('error');
            return;
        }
        setEStatus('loading');
        try {
            await apiService.createExerciseForUser(eForm.targetUser.trim(), {
                name: eForm.name, type: eForm.muscle, description: eForm.equipment,
                videoUrl: '', imagePath: '', durationTime: 0
            });
            setEStatus('success');
            setEMsg(`✅ Ejercicio "${eForm.name}" creado para ${eForm.targetUser}`);
            setEForm({ targetUser: '', name: '', muscle: '', equipment: '' });
            createSnack(`Ejercicio asignado a ${eForm.targetUser}`, 'success');
        } catch (err) {
            setEStatus('error');
            setEMsg(`Error: ${(err as Error).message || 'Error desconocido al crear el ejercicio.'}`);
        }
    };

    return (
        <div className="min-h-screen gym-bg flex flex-col">
            <HeaderGym />
            <Sidebar userRole="trainer" />

            <main className="flex-grow pt-24 px-6 pb-10">
                <div className="mx-auto w-full max-w-4xl">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF5722]">Panel del Entrenador</h1>
                            <p className="text-gray-600 mt-1">Crea entrenamientos y ejercicios personalizados para tus usuarios.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Crear Entrenamiento para usuario */}
                        <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">🏋️ Entrenamiento Personalizado</h2>
                            <p className="text-gray-500 text-sm mb-5">Crea una rutina que aparecerá en los personales del usuario.</p>

                            {wStatus === 'success' && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">{wMsg}</div>}
                            {wStatus === 'error' && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{wMsg}</div>}

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username del usuario</label>
                                    <input type="text" value={wForm.targetUser} onChange={e => setWForm({ ...wForm, targetUser: e.target.value })}
                                        placeholder="ej: alex123" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del entrenamiento</label>
                                    <input type="text" value={wForm.name} onChange={e => setWForm({ ...wForm, name: e.target.value })}
                                        placeholder="ej: Día de Fuerza" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción (opcional)</label>
                                    <textarea value={wForm.description} onChange={e => setWForm({ ...wForm, description: e.target.value })}
                                        rows={2} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ejercicios de la rutina</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[96px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200 custom-scrollbar">
                                      {allExercises.length === 0 && <p className="text-xs text-gray-400 col-span-2">No hay ejercicios disponibles.</p>}
                                      {allExercises.map(ex => {
                                        const isSelected = wForm.selectedExercises.some(e => e.id === ex.id);
                                        return (
                                          <div 
                                            key={ex.id} 
                                            onClick={() => {
                                                if (isSelected) {
                                                    setWForm({ ...wForm, selectedExercises: wForm.selectedExercises.filter(e => e.id !== ex.id) });
                                                } else {
                                                    setWForm({ ...wForm, selectedExercises: [...wForm.selectedExercises, ex] });
                                                }
                                            }}
                                            className={`p-2 rounded-lg border cursor-pointer font-semibold text-xs transition-all ${isSelected ? "bg-[#FF5722] text-white border-[#FF5722] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}
                                          >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {ex.name}
                                          </div>
                                        )
                                      })}
                                    </div>
                                </div>
                                <button onClick={handleCreateWorkout} disabled={wStatus === 'loading'}
                                    className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl transition disabled:opacity-50 shadow-md">
                                    {wStatus === 'loading' ? 'Creando...' : '+ Asignar Entrenamiento'}
                                </button>
                            </div>
                        </div>

                        {/* Crear Ejercicio para usuario */}
                        <div className="bg-white rounded-3xl shadow-md p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">💪 Ejercicio Personalizado</h2>
                            <p className="text-gray-500 text-sm mb-5">Crea un ejercicio que aparecerá en los personales del usuario.</p>

                            {eStatus === 'success' && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-sm">{eMsg}</div>}
                            {eStatus === 'error' && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">{eMsg}</div>}

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username del usuario</label>
                                    <input type="text" value={eForm.targetUser} onChange={e => setEForm({ ...eForm, targetUser: e.target.value })}
                                        placeholder="ej: alex123" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del ejercicio</label>
                                    <input type="text" value={eForm.name} onChange={e => setEForm({ ...eForm, name: e.target.value })}
                                        placeholder="ej: Curl con cable" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupo muscular</label>
                                    <input type="text" value={eForm.muscle} onChange={e => setEForm({ ...eForm, muscle: e.target.value })}
                                        placeholder="ej: Bíceps" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Material</label>
                                    <input type="text" value={eForm.equipment} onChange={e => setEForm({ ...eForm, equipment: e.target.value })}
                                        placeholder="ej: Cable, Mancuernas" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF5722] font-medium text-gray-800" />
                                </div>
                                <button onClick={handleCreateExercise} disabled={eStatus === 'loading'}
                                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition disabled:opacity-50 shadow-md">
                                    {eStatus === 'loading' ? 'Creando...' : '+ Asignar Ejercicio'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <button
                onClick={() => navigate('/dashboard')}
                className="fixed bottom-8 right-8 bg-[#FF5722] hover:bg-[#F4511E] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 z-40"
                title="Volver al Dashboard"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
        </div>
    );
}
