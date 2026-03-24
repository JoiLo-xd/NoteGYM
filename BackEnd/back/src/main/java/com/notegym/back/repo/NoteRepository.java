package com.notegym.back.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.notegym.back.model.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {

}
