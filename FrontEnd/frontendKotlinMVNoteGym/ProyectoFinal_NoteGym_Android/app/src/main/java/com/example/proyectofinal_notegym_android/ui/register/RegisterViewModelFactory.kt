package com.example.proyectofinal_notegym_android.ui.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.proyectofinal_notegym_android.data.NoteGymApi

/**
 * Factory para crear RegisterViewModel con dependencias.
 */
class RegisterViewModelFactory(
    private val api: NoteGymApi
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(RegisterViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return RegisterViewModel(api) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}