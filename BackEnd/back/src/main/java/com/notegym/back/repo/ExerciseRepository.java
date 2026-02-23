package com.notegym.back.repo;

import com.notegym.back.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    // Buscar ejercicios por nombre (ej. "Sentadillas")
    List<Exercise> findByNameContainingIgnoreCase(String name);
    
    // Buscar por tipo
    List<Exercise> findByType(String type);
    
}