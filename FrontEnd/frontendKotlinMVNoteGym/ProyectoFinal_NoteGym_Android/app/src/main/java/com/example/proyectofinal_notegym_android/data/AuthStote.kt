package com.example.proyectofinal_notegym_android.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first

// DataStore = "localStorage" en Android
private val Context.dataStore by preferencesDataStore(name = "auth_store")

class AuthStore(private val context: Context) {

    private val KEY_USERNAME = stringPreferencesKey("username")
    private val KEY_PASSWORD = stringPreferencesKey("password")
    private val KEY_NAME = stringPreferencesKey("name")
    private val KEY_ROLE = stringPreferencesKey("role")

    // React: localStorage.setItem("username", ...)
    suspend fun saveSession(
        username: String?,
        password: String?,
        name: String?,
        role: String?
    ) {
        context.dataStore.edit { prefs ->
            prefs[KEY_USERNAME] = username ?: ""
            prefs[KEY_PASSWORD] = password ?: ""
            prefs[KEY_NAME] = name ?: ""
            prefs[KEY_ROLE] = role ?: ""
        }
    }

    // Por si luego quieres leer sesión (similar a localStorage.getItem)
    suspend fun getUsername(): String {
        val prefs = context.dataStore.data.first()
        return prefs[KEY_USERNAME] ?: ""
    }

    suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }
}