package com.example.proyectofinal_notegym_android.ui.workouts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.proyectofinal_notegym_android.data.Exercise
import com.example.proyectofinal_notegym_android.data.NoteGymApi
import com.example.proyectofinal_notegym_android.data.Workout
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class WorkoutState {
    object Loading : WorkoutState()
    data class Success(
        val globalWorkouts: List<Workout>,
        val personalWorkouts: List<Workout>,
        val globalExercises: List<Exercise>
    ) : WorkoutState()
    data class Error(val message: String) : WorkoutState()
}

class WorkoutViewModel(private val api: NoteGymApi) : ViewModel() {

    private val _state = MutableStateFlow<WorkoutState>(WorkoutState.Loading)
    val state: StateFlow<WorkoutState> = _state

    // Estado para la ejecución del entrenamiento
    private val _currentWorkout = MutableStateFlow<Workout?>(null)
    val currentWorkout: StateFlow<Workout?> = _currentWorkout

    private var pendingWorkoutId: Int? = null

    init {
        loadData()
    }

    fun selectWorkout(workoutId: Int) {
        val currentState = _state.value
        if (currentState is WorkoutState.Success) {
            val workout = (currentState.globalWorkouts + currentState.personalWorkouts).find { it.id == workoutId }
            _currentWorkout.value = workout
            pendingWorkoutId = null
        } else {
            pendingWorkoutId = workoutId
        }
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = WorkoutState.Loading
            try {
                val globalWResponse = api.getGlobalWorkouts()
                val personalWResponse = api.getPersonalWorkouts()
                val globalEResponse = api.getGlobalExercises()

                if (globalWResponse.isSuccessful && personalWResponse.isSuccessful && globalEResponse.isSuccessful) {
                    _state.value = WorkoutState.Success(
                        globalWorkouts = globalWResponse.body() ?: emptyList(),
                        personalWorkouts = personalWResponse.body() ?: emptyList(),
                        globalExercises = globalEResponse.body() ?: emptyList()
                    )
                    // Si se pidió un workout antes de cargar, lo seleccionamos ahora
                    pendingWorkoutId?.let { selectWorkout(it) }
                } else {
                    _state.value = WorkoutState.Error("Error al cargar datos del servidor")
                }
            } catch (e: Exception) {
                _state.value = WorkoutState.Error("Error de conexión: ${e.message}")
            }
        }
    }
}

class WorkoutViewModelFactory(private val api: NoteGymApi) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(WorkoutViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return WorkoutViewModel(api) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
