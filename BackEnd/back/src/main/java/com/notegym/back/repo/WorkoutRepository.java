package com.notegym.back.repo;

import com.notegym.back.model.User;
import com.notegym.back.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Integer> {

    // Workouts creados por un usuario específico (su creador)
    List<Workout> findByUser(User user);

    // Workouts cuyo creador tiene un rol específico (ADMIN → globales)
    List<Workout> findByUser_Role(String role);
}
