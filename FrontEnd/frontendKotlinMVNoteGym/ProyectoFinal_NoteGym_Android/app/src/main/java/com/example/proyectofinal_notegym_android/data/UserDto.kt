package com.example.proyectofinal_notegym_android.data

// DTO que representa la RESPUESTA del backend en el login
// Es el objeto que Retrofit crea a partir del JSON que devuelve Spring Boot
// React: const data = await res.json()
data class UserDto(

    // Identificador del usuario
    // React: data.username
    val username: String? = null,

    // Password devuelta por el backend (tal y como está ahora implementado)
    // React: data.password
    val password: String? = null,

    // Nombre real del usuario
    // React: data.name
    val name: String? = null,

    // Rol del usuario (user / admin)
    // React: data.role
    val role: String? = null
)