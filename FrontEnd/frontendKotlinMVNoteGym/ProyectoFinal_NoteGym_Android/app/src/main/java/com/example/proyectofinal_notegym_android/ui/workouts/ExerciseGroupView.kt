package com.example.proyectofinal_notegym_android.ui.workouts

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.proyectofinal_notegym_android.data.Exercise
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar

@Composable
fun ExerciseGroupView(
    viewModel: WorkoutViewModel,
    username: String,
    onBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    val orangeNoteGym = Color(0xFFFF7A00)

    Scaffold(
        topBar = {
            HeaderGymBar(
                title = "Biblioteca",
                userName = username,
                onProfileClick = {}
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
                Text("Ejercicios Disponibles", style = MaterialTheme.typography.headlineMedium)
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Buscar ejercicio...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = orangeNoteGym,
                    focusedLabelColor = orangeNoteGym
                ),
                shape = MaterialTheme.shapes.medium
            )

            Spacer(modifier = Modifier.height(16.dp))

            when (val currentState = state) {
                is WorkoutState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = orangeNoteGym)
                    }
                }
                is WorkoutState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(currentState.message, color = MaterialTheme.colorScheme.error)
                        Button(onClick = { viewModel.loadData() }, colors = ButtonDefaults.buttonColors(containerColor = orangeNoteGym)) {
                            Text("Reintentar")
                        }
                    }
                }
                is WorkoutState.Success -> {
                    val filteredExercises = currentState.globalExercises.filter {
                        it.name.contains(searchQuery, ignoreCase = true) ||
                        (it.type?.contains(searchQuery, ignoreCase = true) ?: false)
                    }

                    if (filteredExercises.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("No se encontraron ejercicios", color = Color.Gray)
                        }
                    } else {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(filteredExercises) { exercise ->
                                ExerciseCard(exercise)
                            }
                        }
                    }
                }
            }
        }
    }
}
