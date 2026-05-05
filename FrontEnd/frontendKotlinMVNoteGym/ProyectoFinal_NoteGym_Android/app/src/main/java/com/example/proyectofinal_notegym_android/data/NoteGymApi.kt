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
}
