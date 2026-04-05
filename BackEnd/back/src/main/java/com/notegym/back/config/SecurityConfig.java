package com.notegym.back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    // GEMINI CODE:
    /*
     * @Bean
     * public SecurityFilterChain securityFilterChain(HttpSecurity http) throws
     * Exception {
     * 
     * http
     * 
     * .csrf(AbstractHttpConfigurer::disable)
     * .exceptionHandling(e -> {})
     * // Define las reglas de autorización
     * .authorizeHttpRequests(authorize -> authorize
     * // Rutas públicas: POST, GET all, GET login
     * .requestMatchers("/api/**").permitAll()
     * .requestMatchers("/api/user", "/api/user/login", "/api/user/all").permitAll()
     * 
     * // Cualquier otra petición (que no sea ninguna de las anteriores) requiere
     * autenticación
     * .anyRequest().authenticated()
     * 
     * );
     * 
     * return http.build();
     * }
     */

    // GEMINI CODE 2:

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                // 1. MANEJO DE EXCEPCIONES: Evita que el filtro de seguridad
                // secuestre las excepciones 404/401 de tu controlador.
                .exceptionHandling(e -> {
                })

                .authorizeHttpRequests(authorize -> authorize

                        // 2. RUTAS PÚBLICAS POST (Registro y Login)
                        .requestMatchers(HttpMethod.POST, "/api/user", "/api/user/login").permitAll()

                        // 3. RUTAS PÚBLICAS GET (Listar / Obtener)
                        // Usamos la ruta completa para ser específicos
                        .requestMatchers(HttpMethod.GET, "/api/user/all").permitAll()

                        // Si tienes un GET para un solo usuario:
                        .requestMatchers(HttpMethod.GET, "/api/user/{username}").permitAll() // SOLO PARA PRUEBAS

                        // 4. REGLA GENERAL: Proteger todas las demás rutas/métodos
                        // .anyRequest().authenticated()
                        .anyRequest().permitAll());

        return http.build();
    }
}