package com.example.proyectofinal_notegym_android.ui.login



import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.proyectofinal_notegym_android.data.AuthStore
import com.example.proyectofinal_notegym_android.data.NoteGymApi

class LoginViewModelFactory(
    private val api: NoteGymApi,
    private val authStore: AuthStore
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(LoginViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return LoginViewModel(api, authStore) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
    }
}