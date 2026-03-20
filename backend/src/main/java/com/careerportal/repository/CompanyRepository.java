package com.careerportal.repository;

import com.careerportal.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByUserId(Long userId);

    @Query("SELECT c FROM Company c JOIN FETCH c.user WHERE c.id = :id")
    Optional<Company> findByIdWithUser(Long id);

    @Query("SELECT c FROM Company c JOIN FETCH c.user WHERE c.user.id = :userId")
    Optional<Company> findByUserIdWithUser(Long userId);

    @Query("SELECT c FROM Company c JOIN FETCH c.user u WHERE " +
           "(:name IS NULL OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:industry IS NULL OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :industry, '%'))) AND " +
           "(:afterFilter = false OR c.createdAt >= :after)")
    List<Company> search(String name, String email, String industry, boolean afterFilter, Instant after);

    @Query("SELECT c FROM Company c JOIN FETCH c.user")
    List<Company> findAllWithUser();
}
