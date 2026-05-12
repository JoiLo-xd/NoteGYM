package com.example.proyectofinal_notegym_android.nav

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.proyectofinal_notegym_android.data.ApiClient
import com.example.proyectofinal_notegym_android.data.AuthStore
import com.example.proyectofinal_notegym_android.ui.dashboard.DashboardView
import com.example.proyectofinal_notegym_android.ui.login.LoginView
import com.example.proyectofinal_notegym_android.ui.login.LoginViewModel
import com.example.proyectofinal_notegym_android.ui.login.LoginViewModelFactory
import com.example.proyectofinal_notegym_android.ui.profile.ProfileView
import com.example.proyectofinal_notegym_android.ui.register.RegisterView
import com.example.proyectofinal_notegym_android.ui.register.RegisterViewModel
import com.example.proyectofinal_notegym_android.ui.register.RegisterViewModelFactory
import com.example.proyectofinal_notegym_android.ui.workouts.WorkoutView
import com.example.proyectofinal_notegym_android.ui.workouts.WorkoutViewModel
import com.example.proyectofinal_notegym_android.ui.workouts.WorkoutViewModelFactory
import com.example.proyectofinal_notegym_android.ui.workouts.WorkoutExecutionView
import androidx.compose.runtime.collectAsState
import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavType
import androidx.navigation.navArgument
import com.example.proyectofinal_notegym_android.ui.workouts.WorkoutState
import kotlinx.coroutines.launch

@Composable
fun AppNavGraph(
    navController: NavHostController,
    startDestination: String = NavRoutes.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(NavRoutes.Login.route) {
            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }

            val vm: LoginViewModel = viewModel(
                factory = LoginViewModelFactory(
                    api = ApiClient.api,
                    authStore = authStore
                )
            )

            LoginView(
                viewModel = vm,
                onGoRegister = { navController.navigate(NavRoutes.Register.route) },
                onGoDashboard = {
                    navController.navigate(NavRoutes.Dashboard.route) {
                        popUpTo(NavRoutes.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.Register.route) {
            // VM con Factory porque necesita ApiClient
            val vm: RegisterViewModel = viewModel(
                factory = RegisterViewModelFactory(api = ApiClient.api)
            )

            RegisterView(
                viewModel = vm,
                onGoLogin = {
                    navController.navigate(NavRoutes.Login.route) {
                        // Evita volver a Register con el botón atrás
                        popUpTo(NavRoutes.Register.route) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.Dashboard.route) {

            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }

            val scope = rememberCoroutineScope()

            val usernameState = remember { mutableStateOf("") }

            // Cargamos username al entrar
            LaunchedEffect(Unit) {
                usernameState.value = authStore.getUsername()
            }

    DashboardView(
        username = usernameState.value,
        onLogout = {
            scope.launch {
                authStore.clearSession()

                navController.navigate(NavRoutes.Login.route) {
                    popUpTo(NavRoutes.Dashboard.route) { inclusive = true }
                }
            }
        },
        onGoProfile = {
            navController.navigate(NavRoutes.Profile.route)
        },
        onGoWorkouts = {
            navController.navigate(NavRoutes.Workouts.route)
        },
        onGoGroups = {
            navController.navigate(NavRoutes.Groups.route)
        }
    )
        }

        composable(NavRoutes.Profile.route) {
            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }
            val usernameState = remember { mutableStateOf("") }

            LaunchedEffect(Unit) {
                usernameState.value = authStore.getUsername()
            }

            ProfileView(
                username = usernameState.value,
                onBack = { navController.popBackStack() }
            )
        }

        composable(NavRoutes.Workouts.route) {
            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }
            val usernameState = remember { mutableStateOf("") }

            LaunchedEffect(Unit) {
                usernameState.value = authStore.getUsername()
            }

            val vm: WorkoutViewModel = viewModel(
                factory = WorkoutViewModelFactory(api = ApiClient.api)
            )

            WorkoutView(
                viewModel = vm,
                username = usernameState.value,
                onBack = { navController.popBackStack() },
                onWorkoutClick = { workoutId ->
                    navController.navigate(NavRoutes.WorkoutExecution.createRoute(workoutId))
                }
            )
        }

        composable(NavRoutes.Groups.route) {
            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }
            val usernameState = remember { mutableStateOf("") }

            LaunchedEffect(Unit) {
                usernameState.value = authStore.getUsername()
            }

            // De momento usamos WorkoutView pero podríamos filtrar por grupos
            val vm: WorkoutViewModel = viewModel(
                factory = WorkoutViewModelFactory(api = ApiClient.api)
            )

            WorkoutView(
                viewModel = vm,
                username = usernameState.value,
                onBack = { navController.popBackStack() },
                onWorkoutClick = { workoutId ->
                    navController.navigate(NavRoutes.WorkoutExecution.createRoute(workoutId))
                }
            )
        }

        composable(
            route = NavRoutes.WorkoutExecution.route,
            arguments = listOf(navArgument("workoutId") { type = NavType.StringType })
        ) { backStackEntry ->
            val workoutIdString = backStackEntry.arguments?.getString("workoutId")
            val workoutId = workoutIdString?.toIntOrNull()
            
            Log.d("AppNavGraph", "Navegando a WorkoutExecution con ID: $workoutIdString (parsed: $workoutId)")

            if (workoutId == null) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("ID de entrenamiento no válido: $workoutIdString")
                }
                return@composable
            }
            
            val context = LocalContext.current
            val authStore = remember { AuthStore(context) }
            val usernameState = remember { mutableStateOf("") }

            LaunchedEffect(Unit) {
                usernameState.value = authStore.getUsername()
            }

            val vm: WorkoutViewModel = viewModel(
                factory = WorkoutViewModelFactory(api = ApiClient.api)
            )

            val state by vm.state.collectAsState()
            val workout by vm.currentWorkout.collectAsState()

            LaunchedEffect(workoutId) {
                vm.selectWorkout(workoutId)
            }

            Log.d("AppNavGraph", "Estado actual: $state, Workout: ${workout?.name}")

            when {
                workout != null -> {
                    WorkoutExecutionView(
                        workout = workout!!,
                        username = usernameState.value,
                        onFinish = { _, _, _ ->
                            navController.navigate(NavRoutes.Dashboard.route) {
                                popUpTo(NavRoutes.Dashboard.route) { inclusive = true }
                            }
                        },
                        onBack = { navController.popBackStack() }
                    )
                }
                state is WorkoutState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Cargando entrenamiento...")
                        }
                    }
                }
                state is WorkoutState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text((state as WorkoutState.Error).message, color = MaterialTheme.colorScheme.error)
                        Button(onClick = { vm.loadData() }) {
                            Text("Reintentar")
                        }
                    }
                }
                else -> {
                    // Si no es loading, ni error, ni tenemos el workout, 
                    // puede que el ID no exista en la lista o se esté procesando.
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No se encontró el entrenamiento con ID: $workoutId")
                    }
                }
            }
        }
    }
}