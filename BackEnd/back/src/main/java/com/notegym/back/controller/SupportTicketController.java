package com.notegym.back.controller;

import com.notegym.back.model.SupportTicket;
import com.notegym.back.model.User;
import com.notegym.back.repo.SupportTicketRepository;
import com.notegym.back.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    @Autowired
    private SupportTicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Cualquier persona (incluso sin sesión) puede enviar un ticket de soporte.
     * No requiere JWT → endpoint público.
     */
    @PostMapping("/ticket")
    public ResponseEntity<String> createTicket(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String message = body.get("message");

        if (username == null || username.isBlank() || message == null || message.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username y mensaje son obligatorios.");
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setUsername(username.trim());
        ticket.setMessage(message.trim());
        ticket.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        ticket.setIsRead(false);

        ticketRepository.save(ticket);
        return ResponseEntity.ok("Ticket enviado correctamente.");
    }

    /**
     * Obtiene todos los tickets no leídos (solo admin).
     */
    @GetMapping("/tickets/unread")
    public ResponseEntity<List<SupportTicket>> getUnreadTickets() {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(ticketRepository.findByIsReadFalseOrderByCreatedAtDesc());
    }

    /**
     * Devuelve el número de tickets no leídos (solo admin).
     */
    @GetMapping("/tickets/count")
    public ResponseEntity<Long> getUnreadCount() {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(ticketRepository.countByIsReadFalse());
    }

    /**
     * Marca un ticket como leído (solo admin).
     */
    @PutMapping("/tickets/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Integer id) {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Sin permisos.");
        Optional<SupportTicket> opt = ticketRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ticket no encontrado.");
        SupportTicket t = opt.get();
        t.setIsRead(true);
        ticketRepository.save(t);
        return ResponseEntity.ok("Ticket marcado como leído.");
    }

    /**
     * Marca todos los tickets como leídos (solo admin).
     */
    @PutMapping("/tickets/read-all")
    public ResponseEntity<String> markAllAsRead() {
        if (!isAdmin()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Sin permisos.");
        List<SupportTicket> unread = ticketRepository.findByIsReadFalseOrderByCreatedAtDesc();
        unread.forEach(t -> t.setIsRead(true));
        ticketRepository.saveAll(unread);
        return ResponseEntity.ok("Todos los tickets marcados como leídos.");
    }

    private boolean isAdmin() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) return false;
            String role = userOpt.get().getRole();
            if (role == null) return false;
            return role.trim().equalsIgnoreCase("ADMIN") || role.trim().equalsIgnoreCase("ADMINISTRADOR");
        } catch (Exception e) {
            return false;
        }
    }
}
