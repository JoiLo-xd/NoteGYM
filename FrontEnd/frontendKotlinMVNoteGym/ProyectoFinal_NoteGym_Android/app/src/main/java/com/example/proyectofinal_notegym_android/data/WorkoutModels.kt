package com.example.proyectofinal_notegym_android.data

data class Exercise(
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    val type: String? = null,
    val videoUrl: String? = null,
    val imagePath: String? = null,
    val durationTime: Int? = null,
    val global: Boolean = false,
    val user: UserDto? = null // Para saber quién lo creó
)

data class Workout(
    val id: Int? = null,
    val name: String,
    val description: String? = null,
    val global: Boolean = false,
    val exercises: List<Exercise> = emptyList(),
    val user: UserDto? = null // Para saber quién lo creó
)
