package com.example.proyectofinal_notegym_android.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.proyectofinal_notegym_android.data.ApiClient
import com.example.proyectofinal_notegym_android.data.UserDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    private val _updateStatus = MutableStateFlow<UpdateStatus>(UpdateStatus.Idle)
    val updateStatus: StateFlow<UpdateStatus> = _updateStatus

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            try {
                val response = ApiClient.api.getProfile()
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = ProfileUiState.Success(response.body()!!)
                } else {
                    _uiState.value = ProfileUiState.Error("Error al cargar el perfil: ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error("Error de red: ${e.message}")
            }
        }
    }

    fun updateProfile(user: UserDto) {
        viewModelScope.launch {
            _updateStatus.value = UpdateStatus.Loading
            try {
                val response = ApiClient.api.updateProfile(user)
                if (response.isSuccessful) {
                    _uiState.value = ProfileUiState.Success(response.body()!!)
                    _updateStatus.value = UpdateStatus.Success
                } else {
                    _updateStatus.value = UpdateStatus.Error("Error al actualizar: ${response.code()}")
                }
            } catch (e: Exception) {
                _updateStatus.value = UpdateStatus.Error("Error de red: ${e.message}")
            }
        }
    }

    fun clearUpdateStatus() {
        _updateStatus.value = UpdateStatus.Idle
    }
}

sealed class UpdateStatus {
    object Idle : UpdateStatus()
    object Loading : UpdateStatus()
    object Success : UpdateStatus()
    data class Error(val message: String) : UpdateStatus()
}

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val user: UserDto) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}
