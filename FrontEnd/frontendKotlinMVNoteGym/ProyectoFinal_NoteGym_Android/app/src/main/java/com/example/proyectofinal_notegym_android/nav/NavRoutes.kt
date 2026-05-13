package com.example.proyectofinal_notegym_android.nav

sealed class NavRoutes(val route: String) {
    data object Login : NavRoutes("login")
    data object Register : NavRoutes("register")
    data object Dashboard : NavRoutes("dashboard")
    data object Profile : NavRoutes("profile")
    data object Workouts : NavRoutes("workouts")
    data object WorkoutExecution : NavRoutes("workout_execution/{workoutId}") {
        fun createRoute(workoutId: Int) = "workout_execution/$workoutId"
    }
    data object ExerciseGroup : NavRoutes("exercise_group")
}