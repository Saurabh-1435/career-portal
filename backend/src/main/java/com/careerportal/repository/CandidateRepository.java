package com.careerportal.repository;

import com.careerportal.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    Optional<Candidate> findByUserId(Long userId);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.user u WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Candidate> searchByNameOrEmail(String q);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.user")
    List<Candidate> findAllWithUser();

    @Query("SELECT c FROM Candidate c JOIN FETCH c.user WHERE c.id = :id")
    Optional<Candidate> findByIdWithUser(Long id);

    @Query("SELECT c FROM Candidate c JOIN FETCH c.user WHERE c.user.id = :userId")
    Optional<Candidate> findByUserIdWithUser(Long userId);
}
