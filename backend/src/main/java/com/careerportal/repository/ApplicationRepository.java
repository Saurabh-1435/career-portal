package com.careerportal.repository;

import com.careerportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.company JOIN FETCH a.candidate c JOIN FETCH c.user WHERE a.job.id = :jobId ORDER BY a.appliedAt DESC")
    List<Application> findByJobIdWithRelationshipsOrderByAppliedAtDesc(Long jobId);

    List<Application> findByJob_Company_Id(Long companyId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.company JOIN FETCH a.candidate c JOIN FETCH c.user WHERE a.job.company.id = :companyId ORDER BY a.appliedAt DESC")
    List<Application> findByCompanyIdWithRelationshipsOrderByAppliedAtDesc(Long companyId);

    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.company JOIN FETCH a.candidate c JOIN FETCH c.user WHERE a.candidate.id = :candidateId ORDER BY a.appliedAt DESC")
    List<Application> findByCandidateIdWithRelationshipsOrderByAppliedAtDesc(Long candidateId);

    long countByJobId(Long jobId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.company JOIN FETCH a.candidate c JOIN FETCH c.user")
    List<Application> findAllWithRelationships();
}
