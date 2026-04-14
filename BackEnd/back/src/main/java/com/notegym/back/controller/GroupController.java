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

import com.notegym.back.model.Group;
import com.notegym.back.repo.GroupRepository;

/**
 * Controlador para la gestión de Grupos
 */
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    /**
     * Obtiene todos los grupos
     * @return ResponseEntity con la lista de grupos
     */
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return ResponseEntity.ok(groups);
    }

    /**
     * Obtiene un grupo específico por ID
     * @param id ID del grupo
     * @return ResponseEntity con el grupo o 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Integer id) {
        Optional<Group> groupOptional = groupRepository.findById(id);

        if (groupOptional.isPresent()) {
            return ResponseEntity.ok(groupOptional.get());
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    /**
     * Elimina un grupo por ID
     * @param id ID del grupo a eliminar
     * @return ResponseEntity con mensaje de confirmación o 404 si no existe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteGroup(@PathVariable Integer id) {
        if (groupRepository.existsById(id)) {
            groupRepository.deleteById(id);
            return ResponseEntity.ok("Grupo eliminado correctamente");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el grupo");
    }
}