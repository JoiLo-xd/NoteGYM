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
    onGoProfile: () -> Unit, // Acción para ir al perfil
    onGoWorkouts: () -> Unit, // Acción para ir a Workouts
    onGoGroups: () -> Unit    // Acción para ir a Grupos
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

        DashboardScreenContent(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            username = username,
            onLogout = onLogout,
            onGoProfile = onGoProfile,
            onGoWorkouts = onGoWorkouts,
            onGoGroups = onGoGroups
        )
    }
}

// Separo el contenido del Scaffold para tenerlo ordenado.
@Composable
private fun DashboardScreenContent(
    modifier: Modifier = Modifier,
    username: String,
    onLogout: () -> Unit,
    onGoProfile: () -> Unit,
    onGoWorkouts: () -> Unit,
    onGoGroups: () -> Unit
) {
    val scrollState = rememberScrollState()

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
            onAssignRoutine = onGoWorkouts,
            onViewRoutines = onGoWorkouts
        )

        // Cards inferiores (accesos rápidos).
        QuickSectionsCard(
            onGoProfile = onGoProfile,
            onGoTraining = onGoWorkouts,
            onGoGroups = onGoGroups
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
                text = "Planifica tu entrenamiento y gestiona tus grupos desde aquí.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// Card que agrupa los botones de acciones rápidas.
@Composable
private fun QuickActionsCard(
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

            QuickActionsRow(
                onAssignRoutine = onAssignRoutine,
                onViewRoutines = onViewRoutines
            )
        }
    }
}

// Botonera: dos botones arriba.
@Composable
private fun QuickActionsRow(
    onAssignRoutine: () -> Unit,
    onViewRoutines: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Button(
            onClick = onAssignRoutine,
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF7A00),
                contentColor = Color.White
            )
        ) {
            Text("Asignar rutina")
        }

        OutlinedButton(
            onClick = onViewRoutines,
            modifier = Modifier.weight(1f)
        ) {
            Text("Ver rutinas")
        }
    }
}

// Sección inferior del dashboard.
@Composable
private fun QuickSectionsCard(
    onGoProfile: () -> Unit,
    onGoTraining: () -> Unit,
    onGoGroups: () -> Unit
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
            subtitle = "Rutinas, historial y más",
            icon = Icons.Filled.FitnessCenter,
            onClick = onGoTraining
        )

        SectionCard(
            title = "Grupos",
            subtitle = "Entrenamientos de tu grupo/entrenador",
            icon = Icons.Filled.Inbox,
            onClick = onGoGroups
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
