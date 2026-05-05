package com.example.proyectofinal_notegym_android.data

/**
 * DTO que representa al Usuario completo según el modelo del backend.
 */
data class UserDto(
    val username: String? = null,
    val name: String? = null,
    val mail: String? = null,
    val sex: String? = null,
    val role: String? = null,
    val registdate: String? = null,
    val userToken: String? = null,
    val password: String? = null,
    val triesLogIn: Int? = null,
    val blocked: Boolean? = null
)
