package com.example.proyectofinal_notegym_android.ui.workouts

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
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
import java.util.Locale

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
    var setTimeSeconds by remember { mutableIntStateOf(45) }
    
    // Stats finales
    var totalReps by remember { mutableIntStateOf(0) }
    var totalSeriesCompleted by remember { mutableIntStateOf(0) }
    var totalTimeSeconds by remember { mutableIntStateOf(0) }

    when (step) {
        1 -> WorkoutConfigScreen(
            workout = workout,
            username = username,
            series = seriesPerExercise,
            rest = restTimeSeconds,
            setTime = setTimeSeconds,
            onSeriesChange = { seriesPerExercise = it },
            onRestChange = { restTimeSeconds = it },
            onSetTimeChange = { setTimeSeconds = it },
            onStart = { step = 2 },
            onBack = onBack
        )
        2 -> WorkoutActiveScreen(
            workout = workout,
            username = username,
            seriesTarget = seriesPerExercise,
            restTarget = restTimeSeconds,
            setTarget = setTimeSeconds,
            onComplete = { series, reps, time ->
                totalSeriesCompleted = series
                totalReps = reps
                totalTimeSeconds = time
                step = 3
            }
        )
        3 -> WorkoutSummaryScreen(
            workout = workout,
            username = username,
            totalSeries = totalSeriesCompleted,
            totalReps = totalReps,
            totalTimeSeconds = totalTimeSeconds,
            onFinish = { onFinish(totalSeriesCompleted, totalReps, totalTimeSeconds) }
        )
    }
}

@Composable
fun WorkoutConfigScreen(
    workout: Workout,
    username: String,
    series: Int,
    rest: Int,
    setTime: Int,
    onSeriesChange: (Int) -> Unit,
    onRestChange: (Int) -> Unit,
    onSetTimeChange: (Int) -> Unit,
    onStart: () -> Unit,
    onBack: () -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Scaffold(
        topBar = { HeaderGymBar(title = "Configurar", userName = username, onProfileClick = {}) }
    ) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(24.dp).verticalScroll(rememberScrollState()),
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
                    Text("Duración de cada serie (segundos)", fontWeight = FontWeight.Medium)
                    Slider(
                        value = setTime.toFloat(),
                        onValueChange = { onSetTimeChange(it.toInt()) },
                        valueRange = 5f..120f,
                        steps = 22,
                        colors = SliderDefaults.colors(
                            thumbColor = orangeNoteGym,
                            activeTrackColor = orangeNoteGym,
                            inactiveTrackColor = orangeNoteGym.copy(alpha = 0.24f)
                        )
                    )
                    Text("$setTime segundos", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth(), style = MaterialTheme.typography.titleLarge)
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
    setTarget: Int,
    onComplete: (Int, Int, Int) -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    var currentExerciseIndex by remember { mutableIntStateOf(0) }
    var currentSeries by remember { mutableIntStateOf(1) }
    var isResting by remember { mutableStateOf(false) }
    var restTimeLeft by remember { mutableIntStateOf(restTarget) }
    var setTimeLeft by remember { mutableIntStateOf(setTarget) }
    var totalRepsAccumulated by remember { mutableIntStateOf(0) }
    var totalSeriesAccumulated by remember { mutableIntStateOf(0) }
    var totalTimeSeconds by remember { mutableIntStateOf(0) }

    val currentExercise = workout.exercises.getOrNull(currentExerciseIndex)

    // Timer de tiempo total
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000)
            totalTimeSeconds++
        }
    }

    // Timer de descanso
    LaunchedEffect(isResting) {
        if (isResting) {
            restTimeLeft = restTarget
            while (restTimeLeft > 0) {
                delay(1000)
                restTimeLeft--
            }
            isResting = false
            if (currentSeries < seriesTarget) {
                currentSeries++
            } else {
                if (currentExerciseIndex < workout.exercises.size - 1) {
                    currentExerciseIndex++
                    currentSeries = 1
                } else {
                    onComplete(totalSeriesAccumulated, totalRepsAccumulated, totalTimeSeconds)
                }
            }
        }
    }

    // Timer de set (solo cuando no está descansando)
    LaunchedEffect(isResting, currentSeries, currentExerciseIndex) {
        if (!isResting) {
            setTimeLeft = setTarget
            while (setTimeLeft > 0 && !isResting) {
                delay(1000)
                setTimeLeft--
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
                        Text(restTimeLeft.toString(), style = MaterialTheme.typography.displayLarge, fontWeight = FontWeight.Bold, color = orangeNoteGym)
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    TextButton(onClick = { isResting = false }) { Text("Saltar descanso", color = orangeNoteGym) }
                } else {
                    Text("Serie $currentSeries de $seriesTarget", style = MaterialTheme.typography.titleLarge)
                    
                    Text("Tiempo restante: $setTimeLeft s", style = MaterialTheme.typography.bodyLarge, color = if (setTimeLeft < 5) Color.Red else Color.Black)

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
                            Text("(${setTarget - setTimeLeft}s)", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            OutlinedButton(
                onClick = { onComplete(totalSeriesAccumulated, totalRepsAccumulated, totalTimeSeconds) },
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
    totalTimeSeconds: Int,
    onFinish: () -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    
    val minutes = totalTimeSeconds / 60
    val seconds = totalTimeSeconds % 60
    val timeStr = String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds)

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
                SummaryStat("Tiempo", timeStr, orangeNoteGym)
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
