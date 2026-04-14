package com.notegym.back.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notegym.back.model.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    
    // Puedes añadir métodos personalizados aquí si los necesitas
    // Por ejemplo: List<Log> findByUsername(String username);
    // o Optional<Log> findByIdAndDate(Long id, Date date);
}