package com.notegym.back.controller;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notegym.back.model.Note;
import com.notegym.back.repo.NoteRepository;

@RestController
@RequestMapping("/api/notas")
public class NotasController {

    @Autowired
    private NoteRepository noteRepository;

    // Obtener todas las notas
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotas() {
        List<Note> notas = noteRepository.findAll();
        return ResponseEntity.ok(notas);
    }

    // Obtener una nota por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNotaById(@PathVariable int id) {
        Optional<Note> notaOptional = noteRepository.findById(id);

        if (notaOptional.isPresent()) {
            return ResponseEntity.ok(notaOptional.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Crear una nueva nota
    @PostMapping
    public ResponseEntity<Note> createNota(@RequestBody Note note) {
        // Asignar fecha actual si no viene asignada
        if (note.getNoteDate() == null) {
            note.setNoteDate(new Timestamp(System.currentTimeMillis()));
        }

        Note savedNote = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    // Actualizar una nota existente
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNota(@PathVariable int id, @RequestBody Note noteDetails) {
        Optional<Note> notaOptional = noteRepository.findById(id);

        if (notaOptional.isPresent()) {
            Note existingNote = notaOptional.get();

            // Cambiar Campos
            existingNote.setName(noteDetails.getName());
            existingNote.setText(noteDetails.getText());
            
            Note updatedNote = noteRepository.save(existingNote);
            return ResponseEntity.ok(updatedNote);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    //Delete Note
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNota(@PathVariable int id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return ResponseEntity.ok("Nota eliminada correctamente");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró la nota");
    }
}
