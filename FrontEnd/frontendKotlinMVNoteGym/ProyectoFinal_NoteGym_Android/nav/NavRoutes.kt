package com.example.proyectofinal_notegym_android.nav

sealed class NavRoutes(val route: String) {
    data object Login : NavRoutes("login")
    data object Register : NavRoutes("register")
    data object Dashboard : NavRoutes("dashboard")
    data object Profile : NavRoutes("profile")
}