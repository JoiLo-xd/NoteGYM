package com.example.proyectofinal_notegym_android.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar
import com.example.proyectofinal_notegym_android.ui.dashboard.components.CalendarWidget

// DashboardView es la pantalla principal interna.
// Aquí montamos: header fijo + contenido con scroll.
@Composable
fun DashboardView(
    username: String,        // Nombre leído desde AuthStore (DataStore)
    onLogout: () -> Unit     // Acción de cerrar sesión (la define AppNavGraph)
) {
    Scaffold(
        // Barra superior fija reutilizable.
        topBar = {
            HeaderGymBar(
                title = "Dashboard",
                userName = username,
                onMenuClick = { },     // Sidebar lo dejamos parado por ahora
                onProfileClick = { }   // Perfil lo conectaremos cuando exista esa pantalla
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
            onLogout = onLogout
        )
    }
}

// Separo el contenido del Scaffold para tenerlo ordenado.
@Composable
private fun DashboardScreenContent(
    modifier: Modifier = Modifier,
    username: String,
    onLogout: () -> Unit
) {
    val scrollState = rememberScrollState()

    // selectedDay = día seleccionado en el calendario.
    // 0 significa "ninguno seleccionado".
    val selectedDayState = remember { mutableIntStateOf(0) }

    Column(
        modifier = modifier
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {

        // Card 1: bienvenida.
        WelcomeCard(username = username)

        // Card 2: acciones rápidas (solo UI por ahora).
        QuickActionsCard(
            onCreateNote = { },
            onAssignRoutine = { },
            onViewRoutines = { }
        )

        // Card 3: calendario (misma idea que React, adaptado a móvil).
        CalendarCard(
            selectedDay = selectedDayState.intValue,
            onDaySelected = { day -> selectedDayState.intValue = day }
        )

        // Card 4: panel del día (por ahora placeholder).
        SelectedDayCard(
            selectedDay = selectedDayState.intValue,
            onCreateNote = { }
        )

        // Cards inferiores (accesos rápidos).
        QuickSectionsCard(
            onGoProfile = { },
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

// Card que envuelve el calendario.
@Composable
private fun CalendarCard(
    selectedDay: Int,
    onDaySelected: (Int) -> Unit
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
                text = "Tu calendario",
                style = MaterialTheme.typography.titleMedium
            )

            CalendarWidget(
                selectedDay = selectedDay,
                onDaySelected = onDaySelected
            )
        }
    }
}

// Panel informativo del día seleccionado.
// Luego aquí meteremos lista de notas/rutinas reales.
@Composable
private fun SelectedDayCard(
    selectedDay: Int,
    onCreateNote: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Detalle del día",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.weight(1f)
                )

                val chipText = if (selectedDay == 0) "Sin selección" else "Seleccionado"
                val chipBg = if (selectedDay == 0)
                    MaterialTheme.colorScheme.surfaceVariant
                else
                    MaterialTheme.colorScheme.primaryContainer

                val chipTextColor = if (selectedDay == 0)
                    MaterialTheme.colorScheme.onSurfaceVariant
                else
                    MaterialTheme.colorScheme.onPrimaryContainer

                Surface(
                    color = chipBg,
                    shape = RoundedCornerShape(999.dp)
                ) {
                    Text(
                        text = chipText,
                        color = chipTextColor,
                        style = MaterialTheme.typography.labelMedium,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }

            if (selectedDay == 0) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Filled.EventNote,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(22.dp)
                    )

                    Spacer(modifier = Modifier.width(10.dp))

                    Text(
                        text = "Selecciona un día en el calendario para ver tus notas o rutinas.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                Text(
                    text = "Día $selectedDay",
                    style = MaterialTheme.typography.titleLarge
                )

                Text(
                    text = "Aquí podrás ver y gestionar lo que tengas planificado.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Button(
                    onClick = onCreateNote,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF7A00),
                        contentColor = Color.White
                    )
                ) {
                    Text("Crear nota para este día")
                }
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