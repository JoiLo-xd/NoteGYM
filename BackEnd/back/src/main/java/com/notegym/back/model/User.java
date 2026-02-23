package com.notegym.back.model;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "user")
public class User {

    @Id
    @Column(length = 45)
    private String username;

    @Column(length = 45)
    private String name;

    @Column(length = 55, unique = true, nullable = false)
    private String mail;

    @Column(length = 45)
    private String sex;

    @Column(length = 45, nullable = false)
    private String role;

    @CreationTimestamp
    @Column(name = "registdate", updatable = false, nullable = false)
    private Instant registdate;

    @Column(name = "user_token", length = 150, unique = true)
    private String userToken;

    @Column(nullable = false, length = 150)
    private String password;

    // Si no se ponen estos campos JPA se queja mucho 
    private int triesLogIn; 
    private Boolean blocked; 

    @ManyToMany
    @JoinTable(
        name = "user_exercise", // Nombre exacto de tu tabla intermedia
        joinColumns = @JoinColumn(name = "user_id"), // Columna que apunta a User (username)
        inverseJoinColumns = @JoinColumn(name = "exercise_id") // Columna que apunta a Exercise (id)
    )
    private Set<Exercise> exercises;

    // Getter y Setter para exercises
    public Set<Exercise> getExercises() { return exercises; }
    public void setExercises(Set<Exercise> exercises) { this.exercises = exercises; }

    @OneToMany(mappedBy = "user")
    private List<UserGroup> userGroups;

    // Constructor vacío (Requerido por JPA)
    public User() {}


    // Constructor útil para registros rápidos
    public User(String username, String mail, String role, String password) {
        this.username = username;
        this.mail = mail;
        this.role = role;
        this.password = password;
    }

    // Getters y Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMail() { return mail; }
    public void setMail(String mail) { this.mail = mail; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Instant getRegistdate() { return registdate; }

    public String getUserToken() { return userToken; }
    public void setUserToken(String userToken) { this.userToken = userToken; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getTriesLogIn() { return triesLogIn; }
    public void setTriesLogIn(int triesLogIn) { this.triesLogIn = triesLogIn; }

    public Boolean getBlocked() { return blocked; }
    public void setBlocked(Boolean blocked) { this.blocked = blocked; }
}