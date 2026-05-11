package com.example.proyectofinal_notegym_android.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Contrato de endpoints con Retrofit.
 * Usamos ResponseBody porque el servidor devuelve texto plano (String).
 */
interface NoteGymApi {

    // POST /auth/login -> Devuelve el Token JWT como String
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<okhttp3.ResponseBody>

    // POST /auth/register -> Devuelve un mensaje de éxito/error como String
    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<okhttp3.ResponseBody>

    // --- WORKOUTS ---
    @retrofit2.http.GET("api/workouts/global")
    suspend fun getGlobalWorkouts(): Response<List<Workout>>

    @retrofit2.http.GET("api/workouts/personal")
    suspend fun getPersonalWorkouts(): Response<List<Workout>>

    @retrofit2.http.GET("api/workouts/trainer/{trainerName}")
    suspend fun getTrainerWorkouts(@retrofit2.http.Path("trainerName") trainerName: String): Response<List<Workout>>

    @retrofit2.http.POST("api/workouts")
    suspend fun createWorkout(@retrofit2.http.Body workout: Workout): Response<okhttp3.ResponseBody>

    // --- USER ---
    @retrofit2.http.GET("api/user/perfil")
    suspend fun getProfile(): Response<UserDto>

    @retrofit2.http.POST("api/user/update")
    suspend fun updateProfile(@retrofit2.http.Body user: UserDto): Response<UserDto>

    // --- EXERCISES ---
    @retrofit2.http.GET("api/exercises/global")
    suspend fun getGlobalExercises(): Response<List<Exercise>>

    @retrofit2.http.GET("api/exercises/personal")
    suspend fun getPersonalExercises(): Response<List<Exercise>>

    @retrofit2.http.GET("api/exercises/trainer/{trainerName}")
    suspend fun getTrainerExercises(@retrofit2.http.Path("trainerName") trainerName: String): Response<List<Exercise>>
}
