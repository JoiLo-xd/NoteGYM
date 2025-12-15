package com.notegym.back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    //GEMINI CODE:
   @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        
        http
            // 👈 LÍNEA CRÍTICA: Deshabilita CSRF para APIs REST sin estado
            .csrf(AbstractHttpConfigurer::disable)
            
            // Define las reglas de autorización
            .authorizeHttpRequests(authorize -> authorize
                // Rutas públicas: POST, GET all, GET login
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/api/user", "/api/user/login", "/api/user/all").permitAll()
                
                // Cualquier otra petición (que no sea ninguna de las anteriores) requiere autenticación
                .anyRequest().authenticated()
                
            );

        return http.build();
    }
}
