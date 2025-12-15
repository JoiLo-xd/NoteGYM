package com.notegym.back.controller;

import java.security.Timestamp;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.notegym.back.model.User;
import com.notegym.back.model.jsonTO.LoginJO;
import com.notegym.back.repo.UserRepository;

import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {


    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;


    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll() ;
    }


    @PostMapping("/register")

    @ResponseStatus(HttpStatus.CREATED)
    public String registerUser(@RequestBody User newUser) {
        newUser.setUsername(newUser.getUsername().toLowerCase());
        String username = newUser.getUsername();
        if (userRepository.existsById(username)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este usuario ya esta registrado, no puedes añadirlo");
        }
        else if (userRepository.existsByMail(newUser.getMail())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este email ya esta siendo utilizado");

        }
        
        String pass = passwordEncoder.encode(newUser.getPassword());
        newUser.setPassword(pass);

        userRepository.save(newUser);



        return "EL usuario ha sido registrado correctamente";
    }


    @PostMapping("/login")
    public User LoginUser(@RequestBody LoginJO login) {
        //El frontEnd lo deberia pasar en lowercase...
        login.setUsername(login.getUsername().toLowerCase());
        if (!userRepository.findByUsername(login.getUsername()).isPresent()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se ha encontrado nigun usuario con ese nombre");
        }
        User usuario = userRepository.findByUsername(login.getUsername()).get();
        User userWithoutEncript = usuario;

        if (!passwordEncoder.matches(login.getPassword(), usuario.getPassword())){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contrasenya no es adecuada"); 
        }
        userWithoutEncript.setPassword(login.getPassword());
        
        return userWithoutEncript;
    }
    

    
    


}
