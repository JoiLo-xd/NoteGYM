package com.example.proyectofinal_notegym_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.rememberNavController
import com.example.proyectofinal_notegym_android.data.ApiClient
import com.example.proyectofinal_notegym_android.data.AuthStore
import com.example.proyectofinal_notegym_android.nav.AppNavGraph
import com.example.proyectofinal_notegym_android.ui.theme.ProyectoFinal_NoteGym_AndroidTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicializamos el almacén de sesión y lo vinculamos a la API
        val authStore = AuthStore(this)
        ApiClient.init(authStore)

        enableEdgeToEdge()

        setContent {
            val navController = rememberNavController()

            ProyectoFinal_NoteGym_AndroidTheme {
                AppNavGraph(navController = navController)
            }
        }
    }
}