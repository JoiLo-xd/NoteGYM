package com.notegym.back.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notegym.back.model.Log;
import com.notegym.back.repo.LogRepository;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogRepository logRepository;

    @GetMapping
    public ResponseEntity<List<Log>> getAllLogs() {
        List<Log> logs = logRepository.findAll();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Log> getLogById(@PathVariable Long id) {
        Optional<Log> logOptional = logRepository.findById(id);

        if (logOptional.isPresent()) {
            return ResponseEntity.ok(logOptional.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLog(@PathVariable Long id) {
        if (logRepository.existsById(id)) {
            logRepository.deleteById(id);
            return ResponseEntity.ok("Registro eliminado correctamente");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el registro");
    }
}