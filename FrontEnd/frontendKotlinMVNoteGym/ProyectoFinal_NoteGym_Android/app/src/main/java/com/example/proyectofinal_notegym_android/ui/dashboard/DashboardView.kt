package com.example.proyectofinal_notegym_android.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.proyectofinal_notegym_android.ui.components.HeaderGymBar

@Composable
fun DashboardView(
    username: String,
    onLogout: () -> Unit,
    onGoProfile: () -> Unit,
    onGoWorkouts: () -> Unit,
    onGoExercises: () -> Unit
) {
    Scaffold(
        topBar = {
            HeaderGymBar(
                title = "NoteGYM",
                userName = username,
                onProfileClick = onGoProfile
            )
        }
    ) { paddingValues ->
        DashboardScreenContent(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            username = username,
            onLogout = onLogout,
            onGoProfile = onGoProfile,
            onGoWorkouts = onGoWorkouts,
            onGoExercises = onGoExercises
        )
    }
}

@Composable
private fun DashboardScreenContent(
    modifier: Modifier = Modifier,
    username: String,
    onLogout: () -> Unit,
    onGoProfile: () -> Unit,
    onGoWorkouts: () -> Unit,
    onGoExercises: () -> Unit
) {
    val scrollState = rememberScrollState()
    val orangeNoteGym = Color(0xFFFF7A00)

    Column(
        modifier = modifier
            .verticalScroll(scrollState)
            .background(Color(0xFFF8F9FA))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Bienvenida mejorada
        WelcomeBanner(username = username)

        Text(
            text = "Acceso Rápido",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color.DarkGray
        )

        // Secciones principales como Cards grandes y coloridas
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            MainActionCard(
                title = "Rutinas",
                icon = Icons.Default.FitnessCenter,
                color = orangeNoteGym,
                modifier = Modifier.weight(1f),
                onClick = onGoWorkouts
            )
            MainActionCard(
                title = "Ejercicios",
                icon = Icons.AutoMirrored.Filled.FormatListBulleted,
                color = Color(0xFF333333),
                modifier = Modifier.weight(1f),
                onClick = onGoExercises
            )
        }

        // Otras secciones
        Text(
            text = "Gestión",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color.DarkGray
        )

        ManagementItem(
            title = "Mi Perfil",
            subtitle = "Configuración y datos personales",
            icon = Icons.Default.Person,
            onClick = onGoProfile
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Botón Logout estilizado
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null, tint = Color.Red, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Cerrar Sesión", color = Color.Red, fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(40.dp))
    }
}

@Composable
private fun WelcomeBanner(username: String) {
    val orangeNoteGym = Color(0xFFFF7A00)
    val orangeDark = Color(0xFFE66E00)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .background(Brush.horizontalGradient(listOf(orangeNoteGym, orangeDark)))
                .padding(24.dp)
                .fillMaxWidth()
        ) {
            Column {
                Text(
                    text = "¡Hola, $username!",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "¿Qué vamos a entrenar hoy?",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White.copy(alpha = 0.9f)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    color = Color.White.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "Tu progreso te espera",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            Icon(
                imageVector = Icons.Default.Whatshot,
                contentDescription = null,
                modifier = Modifier
                    .size(80.dp)
                    .align(Alignment.CenterEnd)
                    .padding(end = 8.dp),
                tint = Color.White.copy(alpha = 0.2f)
            )
        }
    }
}

@Composable
private fun MainActionCard(
    title: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(140.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(40.dp))
            Spacer(modifier = Modifier.height(12.dp))
            Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
    }
}

@Composable
private fun ManagementItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    val orangeNoteGym = Color(0xFFFF7A00)
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = orangeNoteGym.copy(alpha = 0.1f),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = orangeNoteGym)
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(subtitle, color = Color.Gray, fontSize = 14.sp)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.LightGray)
        }
    }
}
