export const BASE_URL = "http://13.36.33.157:8080";
export const API_BASE_URL = `${BASE_URL}/api`;
export const AUTH_URL = `${BASE_URL}/auth`;

const getHeaders = (isJson = false): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
  if (isJson) headers['Content-Type'] = 'application/json';
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
  blocked?: boolean;
  triesLogIn?: number;
}

export interface Group {
  id?: number;
  name: string;
  description?: string;
  creationdate?: string;
}

export interface SupportTicket {
  id: number;
  username: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface LoginCredentials { username: string; password?: string; }
export interface RegisterData { username: string; password?: string; name?: string; mail?: string; sex?: string; }

export const apiService = {
  // --- AUTH ---
  login: async (credentials: LoginCredentials): Promise<string> => {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await res.text();
    if (!res.ok) {
      if (body === 'ACCOUNT_BLOCKED') {
        throw new Error('ACCOUNT_BLOCKED');
      }
      if (body.startsWith('WRONG_PASSWORD:')) {
        const remaining = body.split(':')[1];
        throw new Error(`WRONG_PASSWORD:${remaining}`);
      }
      if (body === 'USER_NOT_FOUND') {
        throw new Error('USER_NOT_FOUND');
      }
      throw new Error(body || 'Error en el login');
    }
    return body;
  },

  register: async (userData: RegisterData): Promise<string> => {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error(await res.text() || "Error en el registro");
    return res.text();
  },

  // --- EJERCICIOS ---
  // Globales: creados por ADMIN (visibles para todos)
  getGlobalExercises: async (): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE_URL}/exercises/global`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching global exercises");
    return res.json();
  },

  // Personales: creados por el usuario actual
  getPersonalExercises: async (): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE_URL}/exercises/personal`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching personal exercises");
    return res.json();
  },

  // Crear ejercicio propio (si eres admin → global; si no → personal)
  createExercise: async (exercise: Partial<Exercise>): Promise<Exercise> => {
    const res = await fetch(`${API_BASE_URL}/exercises`, {
      method: "POST", headers: getHeaders(true), body: JSON.stringify(exercise),
    });
    if (!res.ok) throw new Error("Error creating exercise");
    return res.json();
  },

  // Trainer/Admin crea ejercicio para un usuario específico → queda como personal del usuario destino
  createExerciseForUser: async (targetUsername: string, exercise: Partial<Exercise>): Promise<Exercise> => {
    const res = await fetch(`${API_BASE_URL}/exercises/for/${targetUsername}`, {
      method: "POST",
      headers: getHeaders(true), // envía JWT: el trainer está autenticado
      body: JSON.stringify(exercise),
    });
    const body = await res.text();
    if (!res.ok) {
      try {
        const parsed = JSON.parse(body);
        throw new Error(parsed.error || parsed.message || body);
      } catch {
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
    }
    return JSON.parse(body);
  },

  deleteExercise: async (id: number | string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/exercises/${id}`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) throw new Error("Error deleting exercise");
  },

  // --- WORKOUTS ---
  // Globales: creados por ADMIN
  getGlobalWorkouts: async (): Promise<Workout[]> => {
    const res = await fetch(`${API_BASE_URL}/workouts/global`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching global workouts");
    return res.json();
  },

  // Personales: creados por el usuario actual
  getPersonalWorkouts: async (): Promise<Workout[]> => {
    const res = await fetch(`${API_BASE_URL}/workouts/personal`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching personal workouts");
    return res.json();
  },

  // Crear workout propio
  createWorkout: async (workout: Partial<Workout>): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts`, {
      method: "POST", headers: getHeaders(true), body: JSON.stringify(workout),
    });
    if (!res.ok) throw new Error("Error creating workout");
    return res.json();
  },

  // Trainer crea workout para un usuario específico → queda como personal del usuario target
  createWorkoutForUser: async (targetUsername: string, workout: Partial<Workout>): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts?targetUser=${targetUsername}`, {
      method: "POST", headers: getHeaders(true), body: JSON.stringify(workout),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}${body ? ': ' + body : ''}`);
    }
    return res.json();
  },

  addExerciseToWorkout: async (workoutId: number, exerciseId: number | string): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
      method: "POST", headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error adding exercise to workout");
    return res.json();
  },

  removeExerciseFromWorkout: async (workoutId: number, exerciseId: number | string): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
      method: "DELETE", headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Error removing exercise from workout");
    return res.json();
  },

  updateWorkout: async (workoutId: number, workout: Partial<Workout>): Promise<Workout> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${workoutId}`, {
      method: "PUT", headers: getHeaders(true), body: JSON.stringify(workout),
    });
    if (!res.ok) throw new Error("Error updating workout");
    return res.json();
  },

  deleteWorkout: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/workouts/${id}`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) throw new Error("Error deleting workout");
  },

  // --- PERFIL ---
  getProfile: async (): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/user/perfil`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching profile");
    return res.json();
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/user/update`, {
      method: "POST", headers: getHeaders(true), body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Error updating profile");
    return res.json();
  },

  // --- ADMIN ---
  unlockUser: async (targetUsername: string, adminCredentials: LoginCredentials): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/user/${targetUsername}/desblock`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(adminCredentials)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || "Error al desbloquear usuario");
    return text;
  },

  unblockUserAdmin: async (targetUsername: string): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${targetUsername}/unblock`, {
      method: 'POST', headers: getHeaders()
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Error al desbloquear usuario');
    return text;
  },

  updateUserAdmin: async (username: string, userData: Partial<User>): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
      method: 'PUT', headers: getHeaders(true), body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error(await res.text() || "Error al actualizar usuario");
    return res.json();
  },

  deleteUserAdmin: async (username: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
      method: 'DELETE', headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text() || "Error al eliminar usuario");
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching users");
    return res.json();
  },

  // --- GRUPOS ---
  createGroup: async (): Promise<Group> => {
    const res = await fetch(`${API_BASE_URL}/groups/create`, {
      method: "POST", headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text() || "Error creando grupo");
    return res.json();
  },

  joinGroup: async (trainerName: string): Promise<Group> => {
    const res = await fetch(`${API_BASE_URL}/groups/join/${trainerName}`, {
      method: "POST", headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text() || "Error uniéndose al grupo");
    return res.json();
  },

  getMyGroup: async (): Promise<Group> => {
    const res = await fetch(`${API_BASE_URL}/groups/my-group`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text() || "No tienes grupo");
    return res.json();
  },

  getMyGroupUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/groups/my-group/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error obteniendo usuarios del grupo");
    return res.json();
  },

  leaveGroup: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE_URL}/groups/leave`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text() || "Error al salir del grupo");
    return res.json();
  },

  deleteGroup: async (): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE_URL}/groups/delete`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) throw new Error(await res.text() || "Error al eliminar el grupo");
    return res.json();
  },

  // --- TRAINER CONTENT ---
  getTrainerExercises: async (trainerName: string): Promise<Exercise[]> => {
    const res = await fetch(`${API_BASE_URL}/exercises/trainer/${trainerName}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching trainer exercises");
    return res.json();
  },

  getTrainerWorkouts: async (trainerName: string): Promise<Workout[]> => {
    const res = await fetch(`${API_BASE_URL}/workouts/trainer/${trainerName}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Error fetching trainer workouts");
    return res.json();
  },

  // --- SOPORTE / TICKETS ---
  sendSupportTicket: async (username: string, message: string): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/support/ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Error al enviar el ticket');
    return text;
  },

  getUnreadTickets: async (): Promise<SupportTicket[]> => {
    const res = await fetch(`${API_BASE_URL}/support/tickets/unread`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error fetching tickets');
    return res.json();
  },

  getUnreadTicketCount: async (): Promise<number> => {
    const res = await fetch(`${API_BASE_URL}/support/tickets/count`, { headers: getHeaders() });
    if (!res.ok) return 0;
    return res.json();
  },

  markTicketRead: async (ticketId: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/support/tickets/${ticketId}/read`, {
      method: 'PUT', headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error marking ticket as read');
  },

  markAllTicketsRead: async (): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/support/tickets/read-all`, {
      method: 'PUT', headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error marking all tickets as read');
  },
};
