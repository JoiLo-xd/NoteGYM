package com.notegym.back.controller;

import java.sql.Timestamp;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notegym.back.model.User;
import com.notegym.back.model.jsonTO.LoginRequestTO;
import com.notegym.back.repo.UserRepository;
import com.notegym.back.service.JWTService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El usuario ya existe");
        }
        if (userRepository.existsByMail(user.getMail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El correo ya esta en uso");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }

        // Fecha de registro
        user.setRegistdate(new Timestamp(System.currentTimeMillis()));

        // Guardar el usuario
        userRepository.save(user);

        return ResponseEntity.ok("Usuario registrado correctamente");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestTO request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Comprobar si la cuenta está bloqueada
            if (Boolean.TRUE.equals(user.getBlocked())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("ACCOUNT_BLOCKED");
            }

            // Comprobar si la contraseña coincide
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // Login correcto → resetear contador de intentos
                user.setTriesLogIn(0);
                userRepository.save(user);
                String token = jwtService.generateToken(user);
                return ResponseEntity.ok(token);
            } else {
                // Contraseña incorrecta → incrementar intentos
                int tries = user.getTriesLogIn() == null ? 0 : user.getTriesLogIn();
                tries++;
                user.setTriesLogIn(tries);

                if (tries >= 3) {
                    user.setBlocked(true);
                    userRepository.save(user);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("ACCOUNT_BLOCKED");
                }

                userRepository.save(user);
                int remaining = 3 - tries;
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("WRONG_PASSWORD:" + remaining);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("USER_NOT_FOUND");
    }

    
    
}
