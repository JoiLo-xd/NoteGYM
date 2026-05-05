package com.example.proyectofinal_notegym_android.ui.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.proyectofinal_notegym_android.data.NoteGymApi
import com.example.proyectofinal_notegym_android.data.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException

/**
 * ViewModel del registro.
 * Maneja validaciones + llamada al backend.
 */
class RegisterViewModel(
    private val api: NoteGymApi
) : ViewModel() {

    // Estado interno mutable
    private val _state = MutableStateFlow(RegisterState())

    // Estado expuesto a la UI (inmutable)
    val state: StateFlow<RegisterState> = _state

    /* -------------------------
       Setters (equivalente a onChange en React)
       ------------------------- */

    fun setUsername(value: String) {
        _state.value = _state.value.copy(username = value)
    }

    fun setName(value: String) {
        _state.value = _state.value.copy(name = value)
    }

    fun setMail(value: String) {
        _state.value = _state.value.copy(mail = value)
    }

    fun setSex(value: String) {
        _state.value = _state.value.copy(sex = value)
    }

    fun setPassword(value: String) {
        _state.value = _state.value.copy(
            password = value,
            passwordValidationMessage = ""
        )
    }

    fun setPasswordRep(value: String) {
        _state.value = _state.value.copy(passwordRep = value)
    }

    fun reset() {
        _state.value = RegisterState()
    }

    /* -------------------------
       Validación de contraseña (copiada de React)
       ------------------------- */

    private fun isPasswordValid(password: String): Boolean {
        val regex = Regex("^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[$;._*-]).+$")
        return regex.containsMatchIn(password)
    }

    /* -------------------------
       Envío del formulario
       ------------------------- */

    fun submit(onGoLogin: () -> Unit) {
        val s = _state.value

        // 1️⃣ Validaciones frontend
        if (
            s.username.isBlank() ||
            s.password.isBlank() ||
            s.passwordRep.isBlank() ||
            s.name.isBlank() ||
            s.mail.isBlank() ||
            s.sex.isBlank()
        ) {
            _state.value = s.copy(
                status = "error",
                serverMessage = "Completa todos los campos."
            )
            return
        }

        if (!isPasswordValid(s.password)) {
            _state.value = s.copy(
                status = "error",
                passwordValidationMessage =
                    "La contraseña debe tener: 1 número, 1 mayúscula, 1 minúscula y 1 símbolo ($;._*-)."
            )
            return
        }

        if (s.password != s.passwordRep) {
            _state.value = s.copy(
                status = "error",
                serverMessage = "Las contraseñas no coinciden."
            )
            return
        }

        // 2️⃣ Llamada al backend
        viewModelScope.launch {
            _state.value = s.copy(
                status = "loading",
                serverMessage = "",
                passwordValidationMessage = ""
            )

            try {
                val response = api.register(
                    RegisterRequest(
                        username = s.username,
                        password = s.password,
                        name = s.name,
                        mail = s.mail,
                        sex = s.sex
                    )
                )

                if (response.isSuccessful) {
                    // Éxito: "Usuario registrado correctamente"
                    val msg = response.body()?.string() ?: "Registro completado"
                    _state.value = _state.value.copy(
                        status = "success",
                        serverMessage = msg
                    )
                    onGoLogin()
                } else {
                    // Error 400: "El usuario ya existe", etc.
                    val errorMsg = response.errorBody()?.string() ?: "Error en el registro"
                    _state.value = _state.value.copy(
                        status = "error",
                        serverMessage = errorMsg
                    )
                }

            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    status = "error",
                    serverMessage = "Error de conexión: ${e.message}"
                )
            }
        }
    }
}