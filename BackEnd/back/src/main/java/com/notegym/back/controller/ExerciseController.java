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
import com.notegym.back.repo.ExerciseRepository;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:5173")
public class ExerciseController {

    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private UserRepository userRepository;

    /** Ejercicios GLOBALES: creados por usuarios con rol ADMIN. */
    @GetMapping("/global")
    public ResponseEntity<List<Exercise>> getGlobalExercises() {
        List<Exercise> exercises = exerciseRepository.findByUser_Role("ADMIN");
        return ResponseEntity.ok(exercises);
    }

    /** Ejercicios PERSONALES del usuario actual. */
    @GetMapping("/personal")
    public ResponseEntity<List<Exercise>> getPersonalExercises() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Exercise> exercises = exerciseRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id) {
        return exerciseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /** Crear ejercicio propio (autenticado). */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createExercise(@RequestBody Exercise exercise) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        exercise.setUser(userOpt.get());
        Exercise saved = exerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(safeExercise(saved));
    }

    /**
     * TRAINER/ADMIN: Crear ejercicio para un usuario específico.
     * Requiere JWT válido. El ejercicio queda guardado como personal del usuario destino.
     */
    @PostMapping("/for/{targetUsername}")
    public ResponseEntity<Map<String, Object>> createExerciseForUser(
            @PathVariable String targetUsername,
            @RequestBody Exercise exercise) {

        String requesterUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> requesterOpt = userRepository.findByUsername(requesterUsername);

        if (requesterOpt.isEmpty() || !isTrainerOrAdmin(requesterOpt.get())) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "No tienes permisos para crear ejercicios para otros usuarios. Se requiere rol TRAINER o ADMIN.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        Optional<User> targetOpt = userRepository.findByUsername(targetUsername);
        if (targetOpt.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "No existe ningún usuario con el username: " + targetUsername);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        }

        exercise.setUser(targetOpt.get());
        Exercise saved = exerciseRepository.save(exercise);

        Map<String, Object> ok = safeExercise(saved);
        ok.put("message", "Ejercicio creado correctamente para el usuario: " + targetUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(ok);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExercise(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Exercise> eOpt = exerciseRepository.findById(id);
        if (eOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ejercicio no encontrado");

        Exercise e = eOpt.get();
        boolean isOwner = e.getUser() != null && e.getUser().getUsername().equals(username);
        boolean isAdmin = userOpt.isPresent() && "ADMIN".equalsIgnoreCase(userOpt.get().getRole());
        if (!isOwner && !isAdmin) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Sin permisos");

        exerciseRepository.deleteById(id);
        return ResponseEntity.ok("Ejercicio eliminado correctamente");
    }

    private Map<String, Object> safeExercise(Exercise e) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", e.getId());
        map.put("name", e.getName());
        map.put("description", e.getDescription());
        map.put("type", e.getType());
        map.put("videoUrl", e.getVideoUrl());
        map.put("imagePath", e.getImagePath());
        map.put("durationTime", e.getDurationTime());
        return map;
    }

    private boolean isTrainerOrAdmin(User user) {
        if (user.getRole() == null) return false;
        String r = user.getRole().trim();
        return r.equalsIgnoreCase("ADMIN")
            || r.equalsIgnoreCase("TRAINER")
            || r.equalsIgnoreCase("ADMINISTRADOR");
    }
}
