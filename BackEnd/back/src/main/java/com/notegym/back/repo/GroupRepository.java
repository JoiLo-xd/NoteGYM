package com.notegym.back.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notegym.back.model.Group;

/**
 * Repository para la gestión de Grupos
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, Integer> {
    
    /**
     * Busca un grupo por nombre
     * @param nombre nombre del grupo
     * @return Optional con el grupo encontrado o vacío
     */
    Optional<Group> findByName(String nombre);

    /**
     * Busca un grupo por nombre (con búsqueda parcial)
     * @param nombre patrón de búsqueda
     * @return Lista de grupos que coincidan
     */
    List<Group> findByNameContaining(String nombre);
}