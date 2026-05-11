package com.example.proyectofinal_notegym_android.ui.workouts

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.proyectofinal_notegym_android.data.Exercise
import com.example.proyectofinal_notegym_android.data.Workout
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar
import kotlinx.coroutines.delay

@Composable
fun WorkoutExecutionView(
    workout: Workout,
    username: String,
    onFinish: (Int, Int, Int) -> Unit, // totalSeries, totalReps, totalTime
    onBack: () -> Unit
) {
    var step by remember { mutableStateOf(1) } // 1: Config, 2: Execution, 3: Summary
    var seriesPerExercise by remember { mutableIntStateOf(3) }
    var restTimeSeconds by remember { mutableIntStateOf(60) }
    
    // Stats finales
    var totalReps by remember { mutableIntStateOf(0) }
    var totalSeriesCompleted by remember { mutableIntStateOf(0) }

    when (step) {
        1 -> WorkoutConfigScreen(
            workout = workout,
            username = username,
            series = seriesPerExercise,
            rest = restTimeSeconds,
            onSeriesChange = { seriesPerExercise = it },
            onRestChange = { restTimeSeconds = it },
            onStart = { step = 2 },
            onBack = onBack
        )
        2 -> WorkoutActiveScreen(
            workout = workout,
            username = username,
            seriesTarget = seriesPerExercise,
            restTarget = restTimeSeconds,
            onComplete = { series, reps ->
                totalSeriesCompleted = series
                totalReps = reps
                step = 3
            }
        )
        3 -> WorkoutSummaryScreen(
            workout = workout,
            username = username,
            totalSeries = totalSeriesCompleted,
            totalReps = totalReps,
            onFinish = { onFinish(totalSeriesCompleted, totalReps, 0) }
        )
    }
}

@Composable
fun WorkoutConfigScreen(
    workout: Workout,
    username: String,
    series: Int,
    rest: Int,
    onSeriesChange: (Int) -> Unit,
    onRestChange: (Int) -> Unit,
    onStart: () -> Unit,
    onBack: () -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Scaffold(
        topBar = { HeaderGymBar(title = "Configurar", userName = username, onProfileClick = {}) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Text(workout.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
            Text("Personaliza tu sesión", style = MaterialTheme.typography.bodyLarge, color = Color.Gray)

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Número de series por ejercicio", fontWeight = FontWeight.Medium)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center, modifier = Modifier.fillMaxWidth()) {
                        IconButton(onClick = { if (series > 1) onSeriesChange(series - 1) }) { 
                            Icon(Icons.Default.Remove, null, tint = orangeNoteGym) 
                        }
                        Text(series.toString(), style = MaterialTheme.typography.displaySmall, modifier = Modifier.padding(horizontal = 24.dp))
                        IconButton(onClick = { onSeriesChange(series + 1) }) { 
                            Icon(Icons.Default.Add, null, tint = orangeNoteGym) 
                        }
                    }
                }
            }

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Tiempo de descanso (segundos)", fontWeight = FontWeight.Medium)
                    Slider(
                        value = rest.toFloat(),
                        onValueChange = { onRestChange(it.toInt()) },
                        valueRange = 10f..180f,
                        steps = 16,
                        colors = SliderDefaults.colors(
                            thumbColor = orangeNoteGym,
                            activeTrackColor = orangeNoteGym,
                            inactiveTrackColor = orangeNoteGym.copy(alpha = 0.24f)
                        )
                    )
                    Text("$rest segundos", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth(), style = MaterialTheme.typography.titleLarge)
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = onStart, 
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = orangeNoteGym)
            ) {
                Text("¡EMPEZAR ENTRENAMIENTO!", fontWeight = FontWeight.Bold, color = Color.White)
            }
            
            TextButton(onClick = onBack) { 
                Text("Cancelar", color = orangeNoteGym) 
            }
        }
    }
}

@Composable
fun WorkoutActiveScreen(
    workout: Workout,
    username: String,
    seriesTarget: Int,
    restTarget: Int,
    onComplete: (Int, Int) -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    var currentExerciseIndex by remember { mutableIntStateOf(0) }
    var currentSeries by remember { mutableIntStateOf(1) }
    var isResting by remember { mutableStateOf(false) }
    var timeLeft by remember { mutableIntStateOf(restTarget) }
    var totalRepsAccumulated by remember { mutableIntStateOf(0) }
    var totalSeriesAccumulated by remember { mutableIntStateOf(0) }

    val currentExercise = workout.exercises.getOrNull(currentExerciseIndex)

    LaunchedEffect(isResting) {
        if (isResting) {
            timeLeft = restTarget
            while (timeLeft > 0) {
                delay(1000)
                timeLeft--
            }
            isResting = false
            if (currentSeries < seriesTarget) {
                currentSeries++
            } else {
                if (currentExerciseIndex < workout.exercises.size - 1) {
                    currentExerciseIndex++
                    currentSeries = 1
                } else {
                    onComplete(totalSeriesAccumulated, totalRepsAccumulated)
                }
            }
        }
    }

    Scaffold(
        topBar = { HeaderGymBar(title = "En curso", userName = username, onProfileClick = {}) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            LinearProgressIndicator(
                progress = { (currentExerciseIndex.toFloat() / workout.exercises.size) },
                modifier = Modifier.fillMaxWidth().clip(CircleShape),
                color = orangeNoteGym,
                trackColor = orangeNoteGym.copy(alpha = 0.2f)
            )
            
            Spacer(modifier = Modifier.height(24.dp))

            if (currentExercise != null) {
                Text("Ejercicio ${currentExerciseIndex + 1} de ${workout.exercises.size}", style = MaterialTheme.typography.labelLarge, color = orangeNoteGym)
                Text(currentExercise.name, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                
                Spacer(modifier = Modifier.height(32.dp))

                if (isResting) {
                    Text("DESCANSO", style = MaterialTheme.typography.headlineSmall, color = Color.Gray)
                    Spacer(modifier = Modifier.height(16.dp))
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(200.dp).background(orangeNoteGym.copy(alpha = 0.1f), CircleShape)) {
                        Text(timeLeft.toString(), style = MaterialTheme.typography.displayLarge, fontWeight = FontWeight.Bold, color = orangeNoteGym)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    TextButton(onClick = { isResting = false }) { Text("Saltar descanso", color = orangeNoteGym) }
                } else {
                    Text("Serie $currentSeries de $seriesTarget", style = MaterialTheme.typography.titleLarge)
                    
                    // Contador de series más prominente y naranja
                    Surface(
                        color = orangeNoteGym.copy(alpha = 0.1f),
                        shape = CircleShape,
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Text(
                            "Series totales: $totalSeriesAccumulated",
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.titleMedium,
                            color = orangeNoteGym,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(250.dp)
                            .clip(CircleShape)
                            .background(orangeNoteGym)
                            .clickable {
                                totalSeriesAccumulated++
                                totalRepsAccumulated += 10 // Asumimos 10 reps por defecto o podríamos pedirlo
                                isResting = true
                            }
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(64.dp))
                            Text("COMPLETAR SERIE", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            OutlinedButton(
                onClick = { onComplete(totalSeriesAccumulated, totalRepsAccumulated) },
                modifier = Modifier.fillMaxWidth(),
                border = androidx.compose.foundation.BorderStroke(1.dp, orangeNoteGym)
            ) {
                Text("Finalizar Entrenamiento", color = orangeNoteGym)
            }
        }
    }
}

@Composable
fun WorkoutSummaryScreen(
    workout: Workout,
    username: String,
    totalSeries: Int,
    totalReps: Int,
    onFinish: () -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Scaffold(
        topBar = { HeaderGymBar(title = "Resumen", userName = username, onProfileClick = {}) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = orangeNoteGym, modifier = Modifier.size(120.dp))
            Text("¡ENTRENAMIENTO COMPLETADO!", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Text(workout.name, style = MaterialTheme.typography.titleLarge, color = Color.Gray)
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                SummaryStat("Series", totalSeries.toString(), orangeNoteGym)
                SummaryStat("Reps", totalReps.toString(), orangeNoteGym)
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Button(
                onClick = onFinish, 
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = orangeNoteGym)
            ) {
                Text("VOLVER AL DASHBOARD", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}

@Composable
fun SummaryStat(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.displaySmall, fontWeight = FontWeight.Bold, color = color)
        Text(label, style = MaterialTheme.typography.bodyLarge)
    }
}
