package com.example.proyectofinal_notegym_android.ui.workouts

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.proyectofinal_notegym_android.data.Exercise
import com.example.proyectofinal_notegym_android.data.Workout
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkoutView(
    viewModel: WorkoutViewModel,
    username: String,
    onBack: () -> Unit,
    onWorkoutClick: (Int) -> Unit
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        topBar = {
            HeaderGymBar(
                title = "Mis Workouts",
                userName = username,
                onProfileClick = { /* Podríamos navegar al perfil si quisiéramos */ }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                }
                Text("Entrenamientos", style = MaterialTheme.typography.headlineMedium)
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (val currentState = state) {
                is WorkoutState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is WorkoutState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(currentState.message, color = MaterialTheme.colorScheme.error)
                        Button(onClick = { viewModel.loadData() }) {
                            Text("Reintentar")
                        }
                    }
                }
                is WorkoutState.Success -> {
                WorkoutContent(
                    globalWorkouts = currentState.globalWorkouts,
                    personalWorkouts = currentState.personalWorkouts,
                    globalExercises = currentState.globalExercises,
                    onWorkoutClick = onWorkoutClick
                )
                }
            }
        }
    }
}

@Composable
fun WorkoutContent(
    globalWorkouts: List<Workout>,
    personalWorkouts: List<Workout>,
    globalExercises: List<Exercise>,
    onWorkoutClick: (Int) -> Unit
) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        item {
            SectionHeader("Workouts Globales (Admin)")
        }
        if (globalWorkouts.isEmpty()) {
            item { Text("No hay workouts globales disponibles", style = MaterialTheme.typography.bodyMedium) }
        } else {
            items(globalWorkouts) { workout ->
                WorkoutCard(workout, "Global", onClick = { workout.id?.let { onWorkoutClick(it) } })
            }
        }

        item {
            SectionHeader("Mis Workouts / Entrenador")
        }
        if (personalWorkouts.isEmpty()) {
            item { Text("No tienes workouts personales", style = MaterialTheme.typography.bodyMedium) }
        } else {
            items(personalWorkouts) { workout ->
                val label = if (workout.user?.role?.contains("TRAINER", ignoreCase = true) == true) "Entrenador" else "Personal"
                WorkoutCard(workout, label, onClick = { workout.id?.let { onWorkoutClick(it) } })
            }
        }

        item {
            SectionHeader("Ejercicios Globales")
        }
        if (globalExercises.isEmpty()) {
            item { Text("No hay ejercicios globales", style = MaterialTheme.typography.bodyMedium) }
        } else {
            items(globalExercises) { exercise ->
                ExerciseCard(exercise)
            }
        }
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleLarge.copy(
            fontWeight = FontWeight.Bold,
            color = Color(0xFFFF7A00)
        ),
        modifier = Modifier.padding(vertical = 8.dp)
    )
}

@Composable
fun WorkoutCard(workout: Workout, sourceLabel: String, onClick: () -> Unit) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(workout.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Badge(containerColor = if (sourceLabel == "Global") orangeNoteGym else Color(0xFF555555)) {
                    Text(sourceLabel, color = Color.White)
                }
            }
            workout.description?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 4.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("${workout.exercises.size} ejercicios", style = MaterialTheme.typography.labelSmall, color = orangeNoteGym)
        }
    }
}

@Composable
fun ExerciseCard(exercise: Exercise) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF5ED))
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = orangeNoteGym)
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(exercise.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
                exercise.type?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
            }
            exercise.durationTime?.let {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Timer, contentDescription = null, modifier = Modifier.size(14.dp), tint = orangeNoteGym)
                    Text(" ${it}s", style = MaterialTheme.typography.bodySmall, color = orangeNoteGym)
                }
            }
        }
    }
}
