package com.notegym.back.repo;

import com.notegym.back.model.UserGroup;
import com.notegym.back.model.UserGroupId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, UserGroupId> {
    
    // Buscar todos los miembros de un grupo específico
    List<UserGroup> findByGroupId(Long groupId);

    // Buscar todos los grupos a los que pertenece un usuario
    List<UserGroup> findByUserUsername(String username);
}