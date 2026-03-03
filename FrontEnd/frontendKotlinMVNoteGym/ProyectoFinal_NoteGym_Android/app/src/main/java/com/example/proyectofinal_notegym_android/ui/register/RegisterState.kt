package com.example.proyectofinal_notegym_android.ui.register

/**
 * Estado completo de la pantalla de registro.
 * Equivale al useState del formulario en React.
 */
data class RegisterState(
    val username: String = "",
    val password: String = "",
    val passwordRep: String = "",
    val name: String = "",
    val mail: String = "",
    val sex: String = "",

    // estado de la UI
    val status: String = "idle", // idle | loading | success | error
    val serverMessage: String = "",
    val passwordValidationMessage: String = ""
)