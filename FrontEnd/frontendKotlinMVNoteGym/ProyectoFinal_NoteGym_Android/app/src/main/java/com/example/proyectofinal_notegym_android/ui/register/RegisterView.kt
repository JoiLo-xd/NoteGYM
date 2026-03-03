package com.example.proyectofinal_notegym_android.ui.register

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.example.proyectofinal_notegym_android.R

@Composable
fun RegisterView(
    viewModel: RegisterViewModel,
    onGoLogin: () -> Unit
) {
    // Observa el estado (equivale al useState/useEffect en React)
    val state by viewModel.state.collectAsState()

    Box(modifier = Modifier.fillMaxSize()) {

        // Fondo como en Login (coherencia visual)
        Image(
            painter = painterResource(id = R.drawable.fondo),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // Logo redondeado igual que Login (marca/identidad)
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "Logo NoteGym",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {

                    Text("Sign in", style = MaterialTheme.typography.headlineSmall)

                    // Mensajes del backend/validaciones
                    if (state.status == "success") {
                        Text("✅ ${state.serverMessage}", color = MaterialTheme.colorScheme.primary)
                    }
                    if (state.status == "error") {
                        Text("⚠️ ${state.serverMessage}", color = MaterialTheme.colorScheme.error)
                    }
                    if (state.passwordValidationMessage.isNotBlank()) {
                        Text(state.passwordValidationMessage, color = MaterialTheme.colorScheme.error)
                    }

                    // Campos (separados para claridad y mantenimiento)
                    OutlinedTextField(
                        value = state.username,
                        onValueChange = { viewModel.setUsername(it) },
                        label = { Text("Username") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = state.name,
                        onValueChange = { viewModel.setName(it) },
                        label = { Text("Name") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = state.mail,
                        onValueChange = { viewModel.setMail(it) },
                        label = { Text("Mail") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = state.sex,
                        onValueChange = { viewModel.setSex(it) },
                        label = { Text("Sex (M/F)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = state.password,
                        onValueChange = { viewModel.setPassword(it) },
                        label = { Text("Password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = state.passwordRep,
                        onValueChange = { viewModel.setPasswordRep(it) },
                        label = { Text("Repeat password") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Botones
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {

                        Button(
                            onClick = { viewModel.submit(onGoLogin) },
                            enabled = state.status != "loading",
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFFF7A00), // naranja como tu login
                                contentColor = Color.White
                            )
                        ) {
                            Text(if (state.status == "loading") "Cargando..." else "Registrar")
                        }

                        OutlinedButton(
                            onClick = { viewModel.reset() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Borrar")
                        }
                    }

                    // Volver a login (flujo: Register -> Login)
                    TextButton(
                        onClick = onGoLogin,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("¿Ya tienes cuenta? Inicia sesión")
                    }
                }
            }
        }
    }
}