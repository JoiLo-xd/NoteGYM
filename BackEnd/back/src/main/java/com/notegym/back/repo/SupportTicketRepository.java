package com.notegym.back.repo;

import com.notegym.back.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {
    List<SupportTicket> findByIsReadFalseOrderByCreatedAtDesc();
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    long countByIsReadFalse();
}
