package com.example.proyectofinal_notegym_android.ui.login

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
fun LoginView(
    viewModel: LoginViewModel,
    onGoRegister: () -> Unit,
    onGoDashboard: () -> Unit
) {
    // Estado observado desde el ViewModel
    // React: const [state, setState] = useState(...)
    val state by viewModel.state.collectAsState()

    // Contenedor raíz de la pantalla
    Box(modifier = Modifier.fillMaxSize()) {

        // Imagen de fondo
        // React: background-image en el contenedor principal
        Image(
            painter = painterResource(id = R.drawable.fondo),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Columna central que contiene todo el login
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            // Logo de la app
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "Logo NoteGym",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tarjeta que contiene el formulario
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

                    // Título del formulario
                    Text(
                        text = "Log in",
                        style = MaterialTheme.typography.headlineSmall
                    )

                    // Mensaje de éxito
                    // React: status === "success"
                    if (state.status == "success") {
                        Text(
                            text = "✅ ${state.serverMessage}",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Mensaje de error
                    // React: status === "error"
                    if (state.status == "error") {
                        Text(
                            text = "⚠️ ${state.serverMessage}",
                            color = MaterialTheme.colorScheme.error
                        )
                    }

                    // Campo username
                    // React: <Input value={formData.username} onChange={...} />
                    OutlinedTextField(
                        value = state.formData.username,
                        onValueChange = {
                            viewModel.handleChange("username", it)
                        },
                        label = { Text("UserName") },
                        placeholder = { Text("Introduce tu nombre de usuario") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Campo password
                    OutlinedTextField(
                        value = state.formData.password,
                        onValueChange = {
                            viewModel.handleChange("password", it)
                        },
                        label = { Text("Password") },
                        placeholder = { Text("Introduce tu contraseña") },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Fila de botones
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {

                        // Botón enviar
                        // React: onSubmit={handleSubmit}
                        Button(
                            onClick = {
                                viewModel.handleSubmit(onGoDashboard)
                            },
                            enabled = state.status != "loading",
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFFF7A00), // 🔥 NARANJA REAL
                                contentColor = Color.White
                            )
                        ) {
                            Text(if (state.status == "loading") "Cargando..." else "Enviar")
                        }

                        // Botón borrar
                        // React: setFormData({ username: "", password: "" })
                        OutlinedButton(
                            onClick = { viewModel.reset() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Borrar")
                        }
                    }

                    TextButton(
                        onClick = {
                            onGoDashboard()
                        },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("Entrar en modo demo")
                    }

                    // Enlace a registro
                    // React: <Link to="/newUserGym">
                    TextButton(
                        onClick = onGoRegister,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text("¿No tienes una cuenta? Regístrate aquí")
                    }
                }
            }
        }
    }
}