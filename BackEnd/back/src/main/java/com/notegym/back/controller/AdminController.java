package com.notegym.back.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.notegym.back.model.User;
import com.notegym.back.repo.UserRepository;

/**
 * AdminController - Endpoints exclusivos para administradores.
 * Gestiona modificación de roles y eliminación de cuentas de usuario.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene la lista de todos los usuarios (solo admin).
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * Modifica el rol (u otros campos) de un usuario específico.
     * Solo el admin puede cambiar roles (a admin, trainer, user).
     */
    @PutMapping("/users/{username}")
    public ResponseEntity<User> updateUser(@PathVariable String username, @RequestBody User userUpdates) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        User user = userOpt.get();

        // Solo se puede cambiar el rol a valores permitidos
        if (userUpdates.getRole() != null) {
            String newRole = userUpdates.getRole().toUpperCase();
            if (newRole.equals("ADMIN") || newRole.equals("TRAINER") || newRole.equals("USER")) {
                user.setRole(newRole);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
        }

        // También se pueden actualizar otros campos si el admin lo decide
        if (userUpdates.getName() != null) user.setName(userUpdates.getName());
        if (userUpdates.getMail() != null) user.setMail(userUpdates.getMail());
        if (userUpdates.getSex() != null) user.setSex(userUpdates.getSex());

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    /**
     * Elimina la cuenta de un usuario específico.
     * Solo el admin puede eliminar cuentas.
     */
    @DeleteMapping("/users/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos de administrador.");
        }

        // Evitar que el admin se elimine a sí mismo
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (currentUser.equalsIgnoreCase(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No puedes eliminar tu propia cuenta de administrador.");
        }

        if (!userRepository.existsById(username)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El usuario no existe.");
        }

        userRepository.deleteById(username);
        return ResponseEntity.ok("Usuario '" + username + "' eliminado correctamente.");
    }

    /**
     * Desbloquea la cuenta de un usuario bloqueado.
     * Solo el admin puede desbloquear cuentas.
     */
    @PostMapping("/users/{username}/unblock")
    public ResponseEntity<String> unblockUser(@PathVariable String username) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos de administrador.");
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El usuario no existe.");
        }

        User user = userOpt.get();
        user.setBlocked(false);
        user.setTriesLogIn(0);
        userRepository.save(user);

        return ResponseEntity.ok("Cuenta de '" + username + "' desbloqueada correctamente.");
    }

    // ===== HELPER =====
    private boolean isAdmin() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;
        String role = userOpt.get().getRole();
        if (role == null) return false;
        return role.trim().equalsIgnoreCase("ADMIN") || role.trim().equalsIgnoreCase("ADMINISTRADOR");
    }
}
