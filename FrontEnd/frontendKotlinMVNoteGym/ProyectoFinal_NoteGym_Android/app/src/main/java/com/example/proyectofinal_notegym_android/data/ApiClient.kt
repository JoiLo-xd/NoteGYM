package com.example.proyectofinal_notegym_android.data

import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// Crea y configura Retrofit (equivalente al axios.create de React)
object ApiClient {

    private const val BASE_URL = "http://13.36.33.157:8080/"

    // Guardamos una referencia al authStore para sacar el token
    private var authStore: AuthStore? = null

    // Método para vincular el almacén de tokens al cliente API
    fun init(store: AuthStore) {
        this.authStore = store
    }

    // Cliente HTTP con el interceptor de seguridad
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request()
            // Usamos .url() para evitar problemas de visibilidad de campos
            val path = request.url().encodedPath()

            // Si la ruta es de /auth/ (login/register), no enviamos cabeceras de seguridad
            if (path.contains("/auth/")) {
                return@addInterceptor chain.proceed(request)
            }

            val token = runBlocking { authStore?.getToken() ?: "" }
            val username = runBlocking { authStore?.getUsername() ?: "" }

            val newRequest = request.newBuilder().apply {
                if (token.isNotEmpty()) {
                    addHeader("Authorization", "Bearer $token")
                }
                // El backend pide username en algunos headers de /api/user/perfil
                if (username.isNotEmpty()) {
                    addHeader("username", username)
                }
            }.build()

            chain.proceed(newRequest)
        }
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    // API lista para usar en ViewModels
    val api: NoteGymApi = retrofit.create(NoteGymApi::class.java)
}
