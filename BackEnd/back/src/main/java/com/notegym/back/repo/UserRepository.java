package com.notegym.back.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notegym.back.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // Spring Data JPA ya sabe que debe buscar por 'username' cuando usas findById(), etc.
    
    public boolean existsByUsername(String username);

    public boolean existsByMail(String mail);

    Optional<User> findByUsername(String username);

    
}

