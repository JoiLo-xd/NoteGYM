package com.notegym.back.repo;

import com.notegym.back.model.Group;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Puedes buscar grupos por nombre si quieres
    Optional<Group> findByName(String name);
}