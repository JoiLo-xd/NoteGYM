package com.example.proyectofinal_notegym_android.data

import java.time.LocalDate

data class Note(
    val id: String = java.util.UUID.randomUUID().toString(),
    val title: String,
    val body: String,
    val createdAt: LocalDate = LocalDate.now()
)
