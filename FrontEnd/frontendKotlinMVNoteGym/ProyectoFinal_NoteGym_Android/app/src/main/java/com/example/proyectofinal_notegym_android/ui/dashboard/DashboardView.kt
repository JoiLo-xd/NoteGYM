package com.example.proyectofinal_notegym_android.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.example.proyectofinal_notegym_android.data.Note
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle

// DashboardView es la pantalla principal interna.
// Aquí montamos: header fijo + contenido con scroll.
@Composable
fun DashboardView(
    username: String,        // Nombre leído desde AuthStore (DataStore)
    onLogout: () -> Unit,    // Acción de cerrar sesión (la define AppNavGraph)
    onGoProfile: () -> Unit  // Acción para ir al perfil
) {
    Scaffold(
        // Barra superior fija reutilizable.
        topBar = {
            HeaderGymBar(
                title = "Dashboard",
                userName = username,
                onProfileClick = onGoProfile
            )
        }
    ) { paddingValues: PaddingValues ->

        // Importante: aquí pasamos también onLogout al contenido.
        // Si no lo pasamos, luego no podríamos usarlo dentro.
        DashboardScreenContent(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            username = username,
            onLogout = onLogout,
            onGoProfile = onGoProfile
        )
    }
}

// Separo el contenido del Scaffold para tenerlo ordenado.
@Composable
private fun DashboardScreenContent(
    modifier: Modifier = Modifier,
    username: String,
    onLogout: () -> Unit,
    onGoProfile: () -> Unit
) {
    val scrollState = rememberScrollState()

    val currentDateState = remember { mutableStateOf(LocalDate.now()) }
    
    // Lista de notas persistente en esta sesión (temporal)
    val notes = remember { mutableStateListOf<Note>() }
    
    // Estado para los diálogos
    var showAddNoteDialog by remember { mutableStateOf(false) }
    var selectedNote by remember { mutableStateOf<Note?>(null) }

    Column(
        modifier = modifier
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

        // Card 1: bienvenida.
        WelcomeCard(username = username)

        // Card 2: acciones rápidas.
        QuickActionsCard(
            onCreateNote = { showAddNoteDialog = true },
            onAssignRoutine = { },
            onViewRoutines = { }
        )

        // Card 3: Bandeja del día (notas y rutinas)
        DailyInboxCard(
            currentDate = currentDateState.value,
            notes = notes.filter { it.createdAt == currentDateState.value },
            onPreviousDay = { currentDateState.value = currentDateState.value.minusDays(1) },
            onNextDay = { currentDateState.value = currentDateState.value.plusDays(1) },
            onCreateNote = { showAddNoteDialog = true },
            onAssignRoutine = { },
            onNoteClick = { selectedNote = it }
        )

        // Cards inferiores (accesos rápidos).
        QuickSectionsCard(
            onGoProfile = onGoProfile,
            onGoTraining = { },
            onGoStats = { }
        )

        // Botón logout (temporal para probar la navegación y limpiar sesión).
        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Cerrar sesión")
        }
    }

    // Diálogo para crear nota
    if (showAddNoteDialog) {
        AddNoteDialog(
            onDismiss = { showAddNoteDialog = false },
            onSave = { title, body ->
                notes.add(Note(title = title, body = body, createdAt = currentDateState.value))
                showAddNoteDialog = false
            }
        )
    }

    // Diálogo para ver/editar/borrar nota
    selectedNote?.let { note ->
        EditNoteDialog(
            note = note,
            onDismiss = { selectedNote = null },
            onSave = { newTitle, newBody ->
                val index = notes.indexOf(note)
                if (index != -1) {
                    notes[index] = note.copy(title = newTitle, body = newBody)
                }
                selectedNote = null
            },
            onDelete = {
                notes.remove(note)
                selectedNote = null
            }
        )
    }
}

@Composable
private fun AddNoteDialog(
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nueva Nota") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Título") },
                    modifier = Modifier.fillMaxWidth()
                )
                TextField(
                    value = body,
                    onValueChange = { body = it },
                    label = { Text("Contenido") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { if (title.isNotBlank()) onSave(title, body) },
                enabled = title.isNotBlank()
            ) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
private fun EditNoteDialog(
    note: Note,
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit,
    onDelete: () -> Unit
) {
    var title by remember { mutableStateOf(note.title) }
    var body by remember { mutableStateOf(note.body) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Detalles de la Nota")
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Filled.Delete,
                        contentDescription = "Borrar nota",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Título") },
                    modifier = Modifier.fillMaxWidth()
                )
                TextField(
                    value = body,
                    onValueChange = { body = it },
                    label = { Text("Contenido") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 5
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { if (title.isNotBlank()) onSave(title, body) },
                enabled = title.isNotBlank()
            ) {
                Text("Actualizar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cerrar")
            }
        }
    )
}

// Card de bienvenida con estilo app (limpio, simple y legible).
@Composable
private fun WelcomeCard(username: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "Bienvenid@, $username",
                style = MaterialTheme.typography.titleLarge
            )
            Text(
                text = "Planifica tu entrenamiento y gestiona tus notas desde aquí.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// Card que agrupa los botones de acciones rápidas.
@Composable
private fun QuickActionsCard(
    onCreateNote: () -> Unit,
    onAssignRoutine: () -> Unit,
    onViewRoutines: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Acciones rápidas",
                style = MaterialTheme.typography.titleMedium
            )

            // Botonera en 2 filas para móvil.
            QuickActionsRow(
                onCreateNote = onCreateNote,
                onAssignRoutine = onAssignRoutine,
                onViewRoutines = onViewRoutines
            )
        }
    }
}

// Botonera: dos botones arriba + uno abajo a ancho completo.
@Composable
private fun QuickActionsRow(
    onCreateNote: () -> Unit,
    onAssignRoutine: () -> Unit,
    onViewRoutines: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onCreateNote,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF7A00),
                    contentColor = Color.White
                )
            ) {
                Text("Crear nota")
            }

            OutlinedButton(
                onClick = onAssignRoutine,
                modifier = Modifier.weight(1f)
            ) {
                Text("Asignar rutina")
            }
        }

        OutlinedButton(
            onClick = onViewRoutines,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Ver rutinas")
        }
    }
}

// Bandeja de entrada diaria
@Composable
private fun DailyInboxCard(
    currentDate: LocalDate,
    notes: List<Note>,
    onPreviousDay: () -> Unit,
    onNextDay: () -> Unit,
    onCreateNote: () -> Unit,
    onAssignRoutine: () -> Unit,
    onNoteClick: (Note) -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Cabecera con flechas y fecha
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onPreviousDay) {
                    Icon(imageVector = Icons.Filled.ChevronLeft, contentDescription = "Día anterior")
                }

                val dateText = when (currentDate) {
                    LocalDate.now() -> "Hoy"
                    LocalDate.now().minusDays(1) -> "Ayer"
                    LocalDate.now().plusDays(1) -> "Mañana"
                    else -> currentDate.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM))
                }

                Text(
                    text = dateText,
                    style = MaterialTheme.typography.titleLarge
                )

                IconButton(onClick = onNextDay) {
                    Icon(imageVector = Icons.Filled.ChevronRight, contentDescription = "Día siguiente")
                }
            }

            // Contenido: Notas y Rutinas
            if (notes.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Inbox,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                    Text(
                        text = "No hay notas ni rutinas para este día.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    notes.forEach { note ->
                        NoteItem(note = note, onClick = { onNoteClick(note) })
                    }
                }
            }

            // Botonera de acciones
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onCreateNote,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF7A00),
                        contentColor = Color.White
                    )
                ) {
                    Text("Añadir nota")
                }

                OutlinedButton(
                    onClick = onAssignRoutine,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Añadir rutina")
                }
            }
        }
    }
}

@Composable
private fun NoteItem(note: Note, onClick: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(text = note.title, style = MaterialTheme.typography.titleSmall)
            if (note.body.isNotBlank()) {
                Text(
                    text = note.body,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2
                )
            }
        }
    }
}

// Sección inferior del dashboard.
@Composable
private fun QuickSectionsCard(
    onGoProfile: () -> Unit,
    onGoTraining: () -> Unit,
    onGoStats: () -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionCard(
            title = "Perfil",
            subtitle = "Edita tus datos y preferencias",
            icon = Icons.Filled.Person,
            onClick = onGoProfile
        )

        SectionCard(
            title = "Entrenamientos",
            subtitle = "Rutinas, historial y notas",
            icon = Icons.Filled.FitnessCenter,
            onClick = onGoTraining
        )

        SectionCard(
            title = "Estadísticas",
            subtitle = "Progreso, marcas y objetivos",
            icon = Icons.Filled.BarChart,
            onClick = onGoStats
        )
    }
}

// Card reutilizable para cada bloque del dashboard.
@Composable
private fun SectionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(text = title, style = MaterialTheme.typography.titleMedium)
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(22.dp),
                tint = Color(0xFFFF7A00)
            )
        }
    }
}
