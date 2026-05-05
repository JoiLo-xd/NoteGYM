package com.example.proyectofinal_notegym_android.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

// DataStore = "localStorage" en Android
private val Context.dataStore by preferencesDataStore(name = "auth_store")

class AuthStore(context: Context) {

    private val context = context.applicationContext
    private val KEY_USERNAME = stringPreferencesKey("username")
    private val KEY_TOKEN = stringPreferencesKey("token")

    // React: localStorage.setItem("token", ...)
    suspend fun saveSession(
        username: String?,
        token: String?
    ) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USERNAME] = username ?: ""
            prefs[KEY_TOKEN] = token ?: ""
        }
    }

    // Por si luego quieres leer sesión (similar a localStorage.getItem)
    suspend fun getUsername(): String {
        val prefs = context.dataStore.data.first()
        return prefs[KEY_USERNAME] ?: ""
    }

    suspend fun getToken(): String {
        val prefs = context.dataStore.data.first()
        return prefs[KEY_TOKEN] ?: ""
    }

    suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }
}