package com.notegym.back.controller;

import java.security.Timestamp;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.notegym.back.model.User;
import com.notegym.back.model.jsonTO.LoginJO;
import com.notegym.back.model.jsonTO.RegisterJO;
import com.notegym.back.repo.UserRepository;

import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthAppController {


    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("com.notegym.back.auditor");


    public AuthAppController(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll() ;
    }


    @PostMapping("/register")

    @ResponseStatus(HttpStatus.CREATED)
    public RegisterJO registerUser(@RequestBody User newUser) {
        newUser.setUsername(newUser.getUsername().toLowerCase());
        String username = newUser.getUsername();
        if (userRepository.existsById(username)){
            AUDIT_LOGGER.warn("REGISTER_FAILED: Aquest usuari ja esta registrat: {}", newUser.getUsername());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este usuario ya esta registrado, no puedes añadirlo");
        }
        else if (userRepository.existsByMail(newUser.getMail())){
            AUDIT_LOGGER.warn("REGISTER_FAILED: Aquest email ja esta utilitzat: {}", newUser.getUsername());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este email ya esta siendo utilizado");

        }
        newUser.setBlocked(false);
        String pass = passwordEncoder.encode(newUser.getPassword());
        newUser.setPassword(pass);
        newUser.setRole("user");

        userRepository.save(newUser);
        RegisterJO newa = new RegisterJO();
        newa.setMensaje("Usuario registrado correctamente");


        return newa;
    }


    @PostMapping("/login")
    public User LoginUser(@RequestBody LoginJO login) {
        //El frontEnd lo deberia pasar en lowercase...
        login.setUsername(login.getUsername().toLowerCase());
        if (!userRepository.findByUsername(login.getUsername()).isPresent()){
            AUDIT_LOGGER.warn("LOGIN_FAILED: Usuario no encontrado: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se ha encontrado nigun usuario con ese nombre");
        }   

        User usuario = userRepository.findByUsername(login.getUsername()).get();
        User userWithoutEncript = usuario;
        /* 
        if (usuario.isBlocked()){
            AUDIT_LOGGER.warn("LOGIN_FAILED: Este usuari esta bloquejat: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Aquest usuari esta bloquejat"); 

        }*/

        if (!passwordEncoder.matches(login.getPassword(), usuario.getPassword())){
            usuario.setTriesLogIn(usuario.getTriesLogIn() + 1);
            if (usuario.getTriesLogIn() == 3){
                usuario.setBlocked( true);
                userRepository.save(usuario);
                AUDIT_LOGGER.warn("LOGIN_FAILED: Contraseya incorrecta, compte bloquejat: {}", login.getUsername());
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contrasenya no es adecuada, ja has intentat els 3 intents, el compte " + usuario.getUsername() + " ha quedat bloqueixat"); 
            }
            userRepository.save(usuario);
            AUDIT_LOGGER.warn("LOGIN_FAILED: Contraseya incorrecta: {}", login.getUsername());

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contrasenya no es adecuada"); 
            
        }
        usuario.setTriesLogIn(0);
        userRepository.save(usuario);
        userWithoutEncript.setPassword(login.getPassword());
        
        return userWithoutEncript;
    }
    
    //Hacer menos redundante
    @PostMapping("/{username}/desblock")
    public String postMethodName(@PathVariable String username, @RequestBody LoginJO login) {
        
        login.setUsername(login.getUsername().toLowerCase());
        if (!userRepository.findByUsername(login.getUsername()).isPresent()){
            AUDIT_LOGGER.warn("DESBLOCK_FAILED: Usuari Admin no trobat: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se ha encontrado nigun usuario admin con ese nombre");
        }
        User usuario = userRepository.findByUsername(login.getUsername()).get();
        if (!passwordEncoder.matches(login.getPassword(), usuario.getPassword())){
            AUDIT_LOGGER.warn("DESBLOCK_FAILED: Contraseya admin incorrecta: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contrasenya no es adecuada"); 
        }

        if (!usuario.getRole().equals("admin")){
            AUDIT_LOGGER.warn("DESBLOCK_FAILED: El usuari no es admin: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Este usuario no es administrador"); 
        }
        /* 
        if (!usuario.isBlocked()){
            AUDIT_LOGGER.warn("DESBLOCK_FAILED: El usuari no esta bloquejat: {}", username);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario admin que intenta desblockear no esta bloquejat");
        }
            */

        if (!userRepository.findByUsername(username).isPresent()){
            AUDIT_LOGGER.warn("DESBLOCK_FAILED: No es troba ningun usuari amb aquest nom per cambiar l'estat: {}", login.getUsername());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se ha encontrado nigun usuario con ese nombre al que intentas cambiar el estado");
        }
    
        User usuarioDesblok = userRepository.findByUsername(username).get();
        
        usuarioDesblok.setBlocked(false);
        usuarioDesblok.setTriesLogIn(0);
        userRepository.save(usuarioDesblok);     

        return "Se ha desblockeado el usuario " + usuarioDesblok.getUsername();
    }
    
    @GetMapping("/info")
    public String getMethodName() {
        return "Esta es una api de NoteGYM, att:Joel (backend developer)";
    }
    

    
    

    
    


}
