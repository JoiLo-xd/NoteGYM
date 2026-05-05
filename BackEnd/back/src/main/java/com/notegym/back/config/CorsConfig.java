package com.notegym.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS gestionado en SecurityConfig via CorsConfigurationSource.
 * Este fichero existe solo para no romper el contexto Spring al compilar.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    // CORS configurado en SecurityConfig.corsConfigurationSource()
}
