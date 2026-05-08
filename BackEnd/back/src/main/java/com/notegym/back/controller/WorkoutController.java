package com.notegym.back.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import com.notegym.back.model.User;
import com.notegym.back.repo.UserRepository;
import com.notegym.back.model.Exercise;
import com.notegym.back.model.Workout;
import com.notegym.back.repo.ExerciseRepository;
import com.notegym.back.repo.WorkoutRepository;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkoutController {

    @Autowired private WorkoutRepository workoutRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private UserRepository userRepository;

    /**
     * Workouts GLOBALES: los creados por un usuario con rol ADMIN.
     * Visibles para todos los usuarios autenticados.
     */
    @GetMapping("/global")
    public ResponseEntity<List<Workout>> getGlobalWorkouts() {
        List<Workout> workouts = workoutRepository.findByUser_Role("ADMIN");
        return ResponseEntity.ok(workouts);
    }

    /**
     * Workouts PERSONALES del usuario actual:
     * Los que ha creado él mismo (y no es admin).
     */
    @GetMapping("/personal")
    public ResponseEntity<List<Workout>> getPersonalWorkouts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Workout> workouts = workoutRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(@PathVariable Integer id) {
        return workoutRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Workouts creados por un entrenador específico.
     */
    @GetMapping("/trainer/{trainerName}")
    public ResponseEntity<List<Workout>> getTrainerWorkouts(@PathVariable String trainerName) {
        Optional<User> userOpt = userRepository.findByUsername(trainerName);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        List<Workout> workouts = workoutRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(workouts);
    }

    /**
     * Crear workout propio (el creador será el usuario actual).
     * - Si es ADMIN → quedará como global (visible para todos).
     * - Si es USER o TRAINER → quedará como personal (solo suyo).
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createWorkout(
            @RequestParam(required = false) String targetUser,
            @RequestBody Workout workout) {
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String finalUser = username;

        // Si se especifica un usuario distinto, validar que el que hace la petición es trainer o admin
        if (targetUser != null && !targetUser.trim().isEmpty() && !targetUser.trim().equals(username)) {
            Optional<User> requesterOpt = userRepository.findByUsername(username);
            if (requesterOpt.isEmpty() || !isTrainerOrAdmin(requesterOpt.get())) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "No tienes permisos para crear workouts para otros usuarios.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }
            finalUser = targetUser.trim();
        }
        
        Optional<User> userOpt = userRepository.findByUsername(finalUser);
        if (userOpt.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Usuario no encontrado: " + finalUser);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        workout.setUser(userOpt.get());
        Workout saved = workoutRepository.save(workout);
        return ResponseEntity.status(HttpStatus.CREATED).body(safeWorkout(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(@PathVariable Integer id, @RequestBody Workout details) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Workout> wOpt = workoutRepository.findById(id);
        if (wOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Workout existing = wOpt.get();
        boolean isOwner = existing.getUser() != null && existing.getUser().getUsername().equals(username);
        boolean canEdit = isOwner || (userOpt.isPresent() && isTrainerOrAdmin(userOpt.get()));
        if (!canEdit) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        return ResponseEntity.ok(workoutRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWorkout(@PathVariable Integer id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Workout> wOpt = workoutRepository.findById(id);
        if (wOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Workout no encontrado");

        Workout w = wOpt.get();
        boolean isOwner = w.getUser() != null && w.getUser().getUsername().equals(username);
        boolean canDelete = isOwner || (userOpt.isPresent() && isTrainerOrAdmin(userOpt.get()));
        if (!canDelete) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Sin permisos");

        workoutRepository.deleteById(id);
        return ResponseEntity.ok("Workout eliminado correctamente");
    }

    @PostMapping("/{workoutId}/exercises/{exerciseId}")
    public ResponseEntity<Workout> addExercise(@PathVariable Integer workoutId, @PathVariable Long exerciseId) {
        Optional<Workout> wOpt = workoutRepository.findById(workoutId);
        Optional<Exercise> eOpt = exerciseRepository.findById(exerciseId);
        if (wOpt.isPresent() && eOpt.isPresent()) {
            Workout w = wOpt.get();
            w.getExercises().add(eOpt.get());
            return ResponseEntity.ok(workoutRepository.save(w));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/{workoutId}/exercises/{exerciseId}")
    public ResponseEntity<Workout> removeExercise(@PathVariable Integer workoutId, @PathVariable Long exerciseId) {
        Optional<Workout> wOpt = workoutRepository.findById(workoutId);
        Optional<Exercise> eOpt = exerciseRepository.findById(exerciseId);
        if (wOpt.isPresent() && eOpt.isPresent()) {
            Workout w = wOpt.get();
            w.getExercises().remove(eOpt.get());
            return ResponseEntity.ok(workoutRepository.save(w));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    private boolean isTrainerOrAdmin(User user) {
        if (user.getRole() == null) return false;
        String r = user.getRole().trim();
        return r.equalsIgnoreCase("ADMIN")
            || r.equalsIgnoreCase("TRAINER")
            || r.equalsIgnoreCase("ADMINISTRADOR");
    }

    // Devuelve solo los campos primitivos del Workout para evitar problemas
    // de serialización con colecciones lazy de Hibernate
    private Map<String, Object> safeWorkout(Workout w) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", w.getId());
        map.put("name", w.getName());
        map.put("description", w.getDescription());
        map.put("exercises", java.util.Collections.emptyList());
        return map;
    }
}
