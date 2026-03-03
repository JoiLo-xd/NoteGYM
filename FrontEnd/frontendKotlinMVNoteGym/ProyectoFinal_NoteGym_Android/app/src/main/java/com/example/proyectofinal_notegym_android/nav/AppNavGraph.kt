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
import com.example.proyectofinal_notegym_android.ui.register.RegisterView
import com.example.proyectofinal_notegym_android.ui.register.RegisterViewModel
import com.example.proyectofinal_notegym_android.ui.register.RegisterViewModelFactory
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
                }
            )
        }
    }
}