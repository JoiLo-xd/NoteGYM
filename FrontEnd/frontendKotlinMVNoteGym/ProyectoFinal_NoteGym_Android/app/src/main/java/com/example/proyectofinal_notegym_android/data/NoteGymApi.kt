package com.example.proyectofinal_notegym_android.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// Contrato de endpoints (Retrofit)
// React: fetch(LOGIN_URL, { method:"POST", body: JSON.stringify(...) })
interface NoteGymApi {

    // POST /api/user/login
    @POST("/api/user/login")
    suspend fun login(@Body body: LoginRequest): Response<UserDto>

    @POST("api/user/register")
    suspend fun register(@Body body: RegisterRequest): RegisterResponse
}
