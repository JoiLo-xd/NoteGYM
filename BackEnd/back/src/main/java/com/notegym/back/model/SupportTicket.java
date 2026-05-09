package com.notegym.back.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "support_ticket")
public class SupportTicket implements java.io.Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "username", nullable = false, length = 45)
    private String username;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    public SupportTicket() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
}
