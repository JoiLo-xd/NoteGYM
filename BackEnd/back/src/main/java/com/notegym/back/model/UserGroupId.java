package com.notegym.back.model;

import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Embeddable;

@Embeddable
public class UserGroupId implements Serializable {
    private String username;
    private Long groupId;

    public UserGroupId() {}

    public UserGroupId(String username, Long groupId) {
        this.username = username;
        this.groupId = groupId;
    }

    // Equals y HashCode son OBLIGATORIOS para llaves compuestas .. Gemini Method.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserGroupId that = (UserGroupId) o;
        return Objects.equals(username, that.username) && Objects.equals(groupId, that.groupId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, groupId);
    }
}