export const BASE_URL = "http://localhost:8080";
export const API_BASE_URL = `${BASE_URL}/api`;
export const AUTH_URL = `${BASE_URL}/auth`;

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

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface RegisterData {
  username: string;
  password?: string;
  name?: string;
  mail?: string;
  sex?: string;
}

export const apiService = {
  // --- AUTH ---
  login: async (credentials: LoginCredentials): Promise<string> => {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Error en el login");
    }
    return res.text(); // El login devuelve el token como texto plano
  },

  register: async (userData: RegisterData): Promise<string> => {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Error en el registro");
    }
    return res.json();
  },

  // --- EJERCICIOS ---
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

  // --- WORKOUTS ---
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

  // --- PERFIL Y USUARIOS ---
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
  },

  // --- ADMIN ---
  unlockUser: async (targetUsername: string, adminCredentials: LoginCredentials): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/user/${targetUsername}/desblock`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(adminCredentials)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || "Error al desbloquear usuario");
    return text;
  },

  updateUserAdmin: async (username: string, userData: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error("Error al actualizar usuario");
    return res.json();
  },

  deleteUserAdmin: async (username: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Error al eliminar usuario");
  }
};
