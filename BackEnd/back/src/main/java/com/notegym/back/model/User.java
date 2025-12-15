package com.notegym.back.model;

import java.security.Timestamp;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity

@Table(name = "user")
public class User {


    @Id
    private String username;

    // Campos de la tabla (ajusta estos campos a las columnas reales de tu tabla 'user')
    private String name;
    private String mail;
    private String sex;
    private String role;
    private String password;
    @CreationTimestamp
    private Instant registDate;

    



    public User(String username, String name, String mail, String sex, String role) {
        this.username = username;
        this.name = name;
        this.mail = mail;
        this.sex = sex;
        this.role = role;
    }

    public User(){
        
    }



    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getMail() {
        return mail;
    }
    public void setMail(String mail) {
        this.mail = mail;
    }
    public String getSex() {
        return sex;
    }
    public void setSex(String sex) {
        this.sex = sex;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public Instant getRegistDate() {
        return registDate;
    }

    




}