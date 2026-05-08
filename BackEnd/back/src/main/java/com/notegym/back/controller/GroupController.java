package com.notegym.back.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import com.notegym.back.model.Group;
import com.notegym.back.model.User;
import com.notegym.back.model.UserGroup;
import com.notegym.back.model.UserGroupId;
import com.notegym.back.repo.GroupRepository;
import com.notegym.back.repo.UserRepository;
import com.notegym.back.repo.UserGroupRepository;

/**
 * Controlador para la gestión de Grupos
 */
@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    @Autowired private GroupRepository groupRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private UserGroupRepository userGroupRepository;

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGroup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Group> existing = groupRepository.findByName(username);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Ya tienes un grupo creado.");
        }

        Group group = new Group();
        group.setName(username);
        group.setDescription("Grupo de entrenamiento de " + username);
        group.setCreationdate(new java.sql.Timestamp(System.currentTimeMillis()));
        Group saved = groupRepository.save(group);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/join/{trainerName}")
    public ResponseEntity<?> joinGroup(@PathVariable String trainerName) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Group> groupOpt = groupRepository.findByName(trainerName);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el grupo del entrenador.");
        }
        Group group = groupOpt.get();

        // Borramos si ya está en otro
        List<UserGroup> existing = userGroupRepository.findByUserUsername(username);
        for(UserGroup ug : existing) {
            userGroupRepository.delete(ug);
        }

        UserGroupId ugId = new UserGroupId(group.getId(), username);
        UserGroup ug = new UserGroup(ugId, group, userOpt.get(), new java.sql.Timestamp(System.currentTimeMillis()));
        userGroupRepository.save(ug);

        return ResponseEntity.ok(group);
    }

    @GetMapping("/my-group")
    public ResponseEntity<?> getMyGroup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Si es entrenador, comprobar si ha creado uno
        Optional<Group> myCreated = groupRepository.findByName(username);
        if (myCreated.isPresent()) {
            return ResponseEntity.ok(myCreated.get());
        }
        
        // Si es usuario, comprobar a cuál se ha unido
        List<UserGroup> joined = userGroupRepository.findByUserUsername(username);
        if (!joined.isEmpty()) {
            return ResponseEntity.ok(joined.get(0).getGroup());
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No perteneces a ningún grupo.");
    }

    @GetMapping("/my-group/users")
    public ResponseEntity<?> getMyGroupUsers() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Group> groupOpt = groupRepository.findByName(username);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No has creado ningún grupo.");
        }
        
        List<User> users = userGroupRepository.findByGroupId(groupOpt.get().getId())
                .stream()
                .map(UserGroup::getUser)
                .toList();
                
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<?> leaveGroup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserGroup> joined = userGroupRepository.findByUserUsername(username);
        if (joined.isEmpty()) {
            return ResponseEntity.badRequest().body("No estás en ningún grupo.");
        }
        for (UserGroup ug : joined) {
            userGroupRepository.delete(ug);
        }
        return ResponseEntity.ok().body("{\"message\": \"Has salido del grupo correctamente\"}");
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteGroup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Group> groupOpt = groupRepository.findByName(username);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No tienes ningún grupo para eliminar.");
        }
        Group group = groupOpt.get();
        
        List<UserGroup> members = userGroupRepository.findByGroupId(group.getId());
        for (UserGroup ug : members) {
            userGroupRepository.delete(ug);
        }
        
        groupRepository.delete(group);
        return ResponseEntity.ok().body("{\"message\": \"Grupo eliminado correctamente\"}");
    }
}