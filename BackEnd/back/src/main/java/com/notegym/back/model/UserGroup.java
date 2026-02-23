package com.notegym.back.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "user_group")
public class UserGroup {

    @EmbeddedId
    private UserGroupId id;

    @ManyToOne
    @MapsId("username") // Mapea la parte 'username' de la llave compuesta
    @JoinColumn(name = "username")
    private User user;

    @ManyToOne
    @MapsId("groupId") // Mapea la parte 'group_id' de la llave compuesta
    @JoinColumn(name = "group_id")
    private Group group;

    @CreationTimestamp
    @Column(name = "register_date", updatable = false)
    private Instant registerDate;

    public UserGroup() {}

    public UserGroupId getId() {
        return id;
    }

    public void setId(UserGroupId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public Instant getRegisterDate() {
        return registerDate;
    }

    public void setRegisterDate(Instant registerDate) {
        this.registerDate = registerDate;
    }

    // Getters y Setters...
    
}