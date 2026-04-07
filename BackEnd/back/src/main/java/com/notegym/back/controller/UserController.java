package com.notegym.back.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notegym.back.model.User;
import com.notegym.back.model.jsonTO.LoginRequestTO;
import com.notegym.back.repo.UserRepository;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/{username}/desblock")
    public ResponseEntity<String> desblockUser(@PathVariable String username, @RequestBody LoginRequestTO adminLogin) {
        
        Optional<User> adminOptional = userRepository.findByUsername(adminLogin.getUsername());
        if (!adminOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin no encontrado.");
        }

        User admin = adminOptional.get();
        if (!passwordEncoder.matches(adminLogin.getPassword(), admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña de admin incorrecta.");
        }
        
        if (admin.getRole() == null || (!admin.getRole().equalsIgnoreCase("ADMIN") && !admin.getRole().equalsIgnoreCase("ADMINISTRADOR"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos de administrador.");
        }

        Optional<User> targetOptional = userRepository.findByUsername(username);
        if (!targetOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El usuario a desbloquear no existe.");
        }

        User targetUser = targetOptional.get();
        targetUser.setBlocked(false);
        targetUser.setTriesLogIn(0);
        userRepository.save(targetUser);

        return ResponseEntity.ok("Se ha desbloqueado el usuario " + targetUser.getUsername());
    }

    @GetMapping("/perfil")
    public ResponseEntity<User> getPerfil() {
        // Obtenemos el nombre de usuario del contexto de seguridad (inyectado por el filtro JWT)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
