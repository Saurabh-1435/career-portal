package com.careerportal.service;

import com.careerportal.dto.*;
import com.careerportal.entity.Company;
import com.careerportal.entity.Job;
import com.careerportal.entity.Candidate;
import com.careerportal.entity.User;
import com.careerportal.repository.*;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper mapper;

    private void ensureAdmin(UserPrincipal principal) {
        if (principal.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            throw new AccessDeniedException("Admin only");
    }

    public AdminDashboardStats getDashboardStats(UserPrincipal principal) {
        ensureAdmin(principal);
        return AdminDashboardStats.builder()
                .totalCandidates(candidateRepository.count())
                .totalCompanies(companyRepository.count())
                .totalJobs(jobRepository.count())
                .totalApplications(applicationRepository.count())
                .build();
    }

    public List<CandidateDto> getAllCandidates(UserPrincipal principal) {
        ensureAdmin(principal);
        return candidateRepository.findAllWithUser().stream().map(mapper::toCandidateDto).collect(Collectors.toList());
    }

    public List<CompanyDto> getAllCompanies(UserPrincipal principal) {
        ensureAdmin(principal);
        return companyRepository.findAllWithUser().stream().map(mapper::toCompanyDto).collect(Collectors.toList());
    }

    public List<JobDto> getAllJobs(UserPrincipal principal) {
        ensureAdmin(principal);
        return jobRepository.findAllWithCompany().stream()
                .sorted((a, b) -> b.getPostedOn().compareTo(a.getPostedOn()))
                .map(j -> mapper.toJobDto(j, applicationRepository.countByJobId(j.getId())))
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> getAllApplications(UserPrincipal principal) {
        ensureAdmin(principal);
        return applicationRepository.findAllWithRelationships().stream()
                .sorted((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()))
                .map(mapper::toApplicationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCandidate(Long id, UserPrincipal principal) {
        ensureAdmin(principal);
        Candidate c = candidateRepository.findById(id).orElseThrow();
        var user = c.getUser();
        applicationRepository.findByCandidateIdOrderByAppliedAtDesc(id).forEach(applicationRepository::delete);
        candidateRepository.delete(c);
        userRepository.delete(user);
    }

    @Transactional
    public void deleteCompany(Long id, UserPrincipal principal) {
        ensureAdmin(principal);
        Company c = companyRepository.findById(id).orElseThrow();
        var user = c.getUser();
        jobRepository.findByCompanyIdOrderByPostedOnDesc(id).forEach(j -> {
            applicationRepository.findByJobIdOrderByAppliedAtDesc(j.getId()).forEach(applicationRepository::delete);
            jobRepository.delete(j);
        });
        companyRepository.delete(c);
        userRepository.delete(user);
    }

    @Transactional
    public void deleteJob(Long id, UserPrincipal principal) {
        ensureAdmin(principal);
        Job j = jobRepository.findById(id).orElseThrow();
        applicationRepository.findByJobIdOrderByAppliedAtDesc(id).forEach(applicationRepository::delete);
        jobRepository.delete(j);
    }

    public List<UserDto> getAllUsers(UserPrincipal principal) {
        ensureAdmin(principal);
        return userRepository.findAll().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .roles(user.getRoles())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserRoles(Long userId, UpdateUserRolesRequest request, UserPrincipal principal) {
        ensureAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRoles(request.getRoles());
        user = userRepository.save(user);
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteUser(Long userId, UserPrincipal principal) {
        ensureAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user has candidate profile
        candidateRepository.findByUserId(userId).ifPresent(candidate -> {
            applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidate.getId())
                    .forEach(applicationRepository::delete);
            candidateRepository.delete(candidate);
        });

        // Check if user has company profile
        companyRepository.findByUserId(userId).ifPresent(company -> {
            jobRepository.findByCompanyIdOrderByPostedOnDesc(company.getId()).forEach(job -> {
                applicationRepository.findByJobIdOrderByAppliedAtDesc(job.getId())
                        .forEach(applicationRepository::delete);
                jobRepository.delete(job);
            });
            companyRepository.delete(company);
        });

        // Finally delete the user
        userRepository.delete(user);
    }

    @Transactional
    public void changeUserPassword(Long userId, String newPassword, UserPrincipal principal) {
        ensureAdmin(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Encode the new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);

        userRepository.save(user);
    }

    @Transactional
    public CompanyDto approveCompany(Long companyId, UserPrincipal principal) {
        ensureAdmin(principal);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        company.setStatus(Company.Status.APPROVED);
        company = companyRepository.save(company);
        return mapper.toCompanyDto(company);
    }

    @Transactional
    public CompanyDto rejectCompany(Long companyId, UserPrincipal principal) {
        ensureAdmin(principal);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        company.setStatus(Company.Status.REJECTED);
        company = companyRepository.save(company);
        return mapper.toCompanyDto(company);
    }

    @lombok.Data
    @lombok.Builder
    public static class AdminDashboardStats {
        private long totalCandidates;
        private long totalCompanies;
        private long totalJobs;
        private long totalApplications;
    }
}
