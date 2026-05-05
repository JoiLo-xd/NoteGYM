package com.notegym.back.repo;

import com.notegym.back.model.Exercise;
import com.notegym.back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    // Buscar ejercicios por nombre
    List<Exercise> findByNameContainingIgnoreCase(String name);

    // Buscar por tipo
    List<Exercise> findByType(String type);

    // Ejercicios de un usuario específico (su creador)
    List<Exercise> findByUser(User user);

    // Ejercicios cuyo creador tiene un rol específico (ADMIN → globales)
    List<Exercise> findByUser_Role(String role);
}