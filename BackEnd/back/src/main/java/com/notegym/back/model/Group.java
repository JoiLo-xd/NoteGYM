package com.notegym.back.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "group") // Nota: 'group' es palabra reservada en SQL, a veces requiere comillas
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 150)
    private String description;

    @CreationTimestamp
    @Column(name = "creationdate", updatable = false)
    private Instant creationDate;

    // Relación con la tabla intermedia para ver los miembros
    @OneToMany(mappedBy = "group")
    private List<UserGroup> members;

    public Group() {}

    // Getters y Setters...
}