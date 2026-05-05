package com.example.proyectofinal_notegym_android.data

/**
 * Respuesta del backend al iniciar sesión.
 * Según la documentación, devuelve el token JWT.
 */
data class LoginResponse(
    val token: String? = null
)
