package com.example.proyectofinal_notegym_android.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Crea y configura Retrofit (equivalente al axios.create de React)
object ApiClient {

    // URL base del backend
    // OJO: 10.0.2.2 es "localhost" desde el emulador Android
    private const val BASE_URL = "http://10.0.2.2:8080"

    // Instancia de Retrofit
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    // API lista para usar en ViewModels
    val api: NoteGymApi = retrofit.create(NoteGymApi::class.java)
}