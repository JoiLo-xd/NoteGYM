package com.example.proyectofinal_notegym_android.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.proyectofinal_notegym_android.data.AuthStore
import com.example.proyectofinal_notegym_android.data.LoginRequest
import com.example.proyectofinal_notegym_android.data.NoteGymApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

// Datos del formulario (igual que formData en React)
data class LoginFormData(
    val username: String = "",
    val password: String = ""
)

// Estado completo de la pantalla (igual que status + serverMessage + formData en React)
data class LoginState(
    val formData: LoginFormData = LoginFormData(),
    val status: String = "idle", // React: "idle" | "loading" | "success" | "error"
    val serverMessage: String = "" // React: serverMessage
)

class LoginViewModel(
    // API para llamar al backend (Retrofit = fetch)
    private val api: NoteGymApi,

    // "localStorage" en Android (DataStore)
    private val authStore: AuthStore
) : ViewModel() {

    // Estado privado y modificable (solo el ViewModel lo cambia)
    private val _state = MutableStateFlow(LoginState())

    // Estado público solo lectura (la UI lo observa)
    val state: StateFlow<LoginState> = _state

    // React: handleChange(e) -> setFormData(...)
    fun handleChange(name: String, value: String) {
        val current = _state.value

        // Actualiza el campo según el "name" (username/password)
        val updatedForm = when (name) {
            "username" -> current.formData.copy(username = value)
            "password" -> current.formData.copy(password = value)
            else -> current.formData
        }

        // React: al escribir, limpiamos error/mensaje si veníamos de error
        val clearedStatus = if (current.status == "error") "idle" else current.status
        val clearedMessage = if (current.status == "error") "" else current.serverMessage

        _state.value = current.copy(
            formData = updatedForm,
            status = clearedStatus,
            serverMessage = clearedMessage
        )
    }

    // React: botón Borrar -> setFormData({..}) + setStatus("idle") + setServerMessage("")
    fun reset() {
        _state.value = LoginState()
    }

    // React: handleSubmit -> fetch("/api/user/login") + guardar en localStorage + navegar
    fun handleSubmit(onGoDashboard: () -> Unit) {
        viewModelScope.launch {
            _state.value = _state.value.copy(status = "loading", serverMessage = "")

            try {
                // Retrofit hace el POST igual que tu fetch
                val res = api.login(
                    LoginRequest(
                        username = _state.value.formData.username,
                        password = _state.value.formData.password
                    )
                )

                if (res.isSuccessful) {
                    val data = res.body()

                    // React: localStorage.setItem(...)
                    authStore.saveSession(
                        username = data?.username,
                        password = data?.password,
                        name = data?.name,
                        role = data?.role
                    )

                    _state.value = _state.value.copy(
                        status = "success",
                        serverMessage = "¡Inicio de sesión exitoso!"
                    )

                    // React: navigate("/dashboard")
                    onGoDashboard()
                } else {
                    _state.value = _state.value.copy(
                        status = "error",
                        serverMessage = "Usuario o contraseña incorrectos."
                    )
                }
            } catch (e: Exception) {
                // Error de red / servidor caído
                _state.value = _state.value.copy(
                    status = "error",
                    serverMessage = "Error de conexión con el servidor. Inténtalo de nuevo."
                )
            }
        }
    }
}