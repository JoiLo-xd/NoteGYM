export const API_BASE_URL = "http://localhost:8080/api";

export interface Exercise {
  id?: number | string;
  name: string;
  description: string;
  type: string;
  videoUrl: string;
  durationTime: number | null;
  imagePath: string;
}

export interface Workout {
  id?: number;
  name: string;
  description: string;
  exercises: Exercise[];
}

export const apiService = {
  // Ejercicios
  getExercises: async (): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE_URL}/exercises`);
    if (!res.ok) throw new Error("Error fetching exercises");
    return res.json();
  },

  createExercise: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const res = await fetch(`${API_BASE_URL}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exercise),
    });
    if (!res.ok) throw new Error("Error creating exercise");
    return res.json();
  },

  deleteExercise: async (id: number | string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error deleting exercise");
  },

  // Workouts
  getWorkouts: async (): Promise<Workout[]> => {
    const res = await fetch(`${API_BASE_URL}/workouts`);
    if (!res.ok) throw new Error("Error fetching workouts");
    return res.json();
  },

  createWorkout: async (workout: Partial<Workout>): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workout),
    });
    if (!res.ok) throw new Error("Error creating workout");
    return res.json();
  },

  addExerciseToWorkout: async (workoutId: number, exerciseId: number | string): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Error adding exercise to workout");
    return res.json();
  },

  deleteWorkout: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error deleting workout");
  }
};
