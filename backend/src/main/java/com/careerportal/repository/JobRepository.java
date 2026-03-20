package com.careerportal.repository;

import com.careerportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.company.id = :companyId ORDER BY j.postedOn DESC")
    List<Job> findByCompanyIdOrderByPostedOnDesc(Long companyId);

    @Query("SELECT j FROM Job j JOIN FETCH j.company")
    List<Job> findAllWithCompany();

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.id = :id")
    Optional<Job> findByIdWithCompany(Long id);
}
