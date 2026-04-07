package com.notegym.back.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;

import com.notegym.back.model.User;
import com.notegym.back.repo.UserRepository;

import com.notegym.back.model.Exercise;
import com.notegym.back.model.Workout;
import com.notegym.back.repo.ExerciseRepository;
import com.notegym.back.repo.WorkoutRepository;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    @Autowired
    private WorkoutRepository workoutRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Workout>> getAllWorkouts() {
        List<Workout> workouts = workoutRepository.findAll();
        return ResponseEntity.ok(workouts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkoutById(@PathVariable Integer id) {
        Optional<Workout> workoutOptional = workoutRepository.findById(id);

        if (workoutOptional.isPresent()) {
            return ResponseEntity.ok(workoutOptional.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping
    public ResponseEntity<Workout> createWorkout(@RequestBody Workout workout) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            workout.setUser(userOpt.get());
            Workout savedWorkout = workoutRepository.save(workout);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWorkout);
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(@PathVariable Integer id, @RequestBody Workout workoutDetails) {
        Optional<Workout> workoutOptional = workoutRepository.findById(id);

        if (workoutOptional.isPresent()) {
            Workout existingWorkout = workoutOptional.get();

            existingWorkout.setName(workoutDetails.getName());
            existingWorkout.setDescription(workoutDetails.getDescription());

            Workout updatedWorkout = workoutRepository.save(existingWorkout);
            return ResponseEntity.ok(updatedWorkout);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWorkout(@PathVariable Integer id) {
        if (workoutRepository.existsById(id)) {
            workoutRepository.deleteById(id);
            return ResponseEntity.ok("Workout eliminado correctamente");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el workout");
    }

    // Gestionar la relacion entre Workout y Exercise (añadir ejercicio a un workout)
    @PostMapping("/{workoutId}/exercises/{exerciseId}")
    public ResponseEntity<Workout> addExerciseToWorkout(@PathVariable Integer workoutId, @PathVariable Long exerciseId) {
        Optional<Workout> workoutOpt = workoutRepository.findById(workoutId);
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);

        if (workoutOpt.isPresent() && exerciseOpt.isPresent()) {
            Workout workout = workoutOpt.get();
            Exercise exercise = exerciseOpt.get();

            workout.getExercises().add(exercise);
            workoutRepository.save(workout);

            return ResponseEntity.ok(workout);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Quitar ejercicio de un workout
    @DeleteMapping("/{workoutId}/exercises/{exerciseId}")
    public ResponseEntity<Workout> removeExerciseFromWorkout(@PathVariable Integer workoutId, @PathVariable Long exerciseId) {
        Optional<Workout> workoutOpt = workoutRepository.findById(workoutId);
        Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);

        if (workoutOpt.isPresent() && exerciseOpt.isPresent()) {
            Workout workout = workoutOpt.get();
            Exercise exercise = exerciseOpt.get();

            if (workout.getExercises().contains(exercise)) {
                workout.getExercises().remove(exercise);
                workoutRepository.save(workout);
            }

            return ResponseEntity.ok(workout);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
