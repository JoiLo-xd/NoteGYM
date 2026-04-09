export const API_BASE_URL = "http://localhost:8080/api";

const getHeaders = (isJson = false): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

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

export interface User {
  id?: number;
  username: string;
  name: string;
  mail: string;
  sex: string;
  role?: string;
  password?: string;
}

export const apiService = {
  // Ejercicios
  getExercises: async (): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE_URL}/exercises`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching exercises");
    return res.json();
  },

  createExercise: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const res = await fetch(`${API_BASE_URL}/exercises`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(exercise),
    });
    if (!res.ok) throw new Error("Error creating exercise");
    return res.json();
  },

  deleteExercise: async (id: number | string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting exercise");
  },

  // Workouts
  getWorkouts: async (): Promise<Workout[]> => {
    const res = await fetch(`${API_BASE_URL}/workouts`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching workouts");
    return res.json();
  },

  createWorkout: async (workout: Partial<Workout>): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(workout),
    });
    if (!res.ok) throw new Error("Error creating workout");
    return res.json();
  },

  addExerciseToWorkout: async (workoutId: number, exerciseId: number | string): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error adding exercise to workout");
    return res.json();
  },

  deleteWorkout: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error deleting workout");
  },

  // Perfil de Usuario
  getProfile: async (): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/user/perfil`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching profile");
    return res.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/user/update`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Error updating profile");
    return res.json();
  }
};
