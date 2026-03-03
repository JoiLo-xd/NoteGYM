package com.example.proyectofinal_notegym_android.data

// DTO del body para POST /api/user/login
// React: JSON.stringify({ username: formData.username, password: formData.password })
data class LoginRequest(

    // username del formulario
    val username: String,

    // password del formulario
    val password: String
)