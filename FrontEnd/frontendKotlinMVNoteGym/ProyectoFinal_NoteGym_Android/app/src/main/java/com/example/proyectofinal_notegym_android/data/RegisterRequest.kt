package com.example.proyectofinal_notegym_android.data

/**
 * Datos que enviamos al backend para registrar un usuario.
 * Coincide 1:1 con el endpoint POST /api/user/register
 */
data class RegisterRequest(
    val username: String,
    val password: String,
    val name: String,
    val mail: String,
    val sex: String
)