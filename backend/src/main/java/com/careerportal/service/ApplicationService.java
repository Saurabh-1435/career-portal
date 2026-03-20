package com.careerportal.service;

import com.careerportal.dto.ApplicationDto;
import com.careerportal.entity.Application;
import com.careerportal.entity.Candidate;
import com.careerportal.entity.Job;
import com.careerportal.repository.ApplicationRepository;
import com.careerportal.repository.CandidateRepository;
import com.careerportal.repository.JobRepository;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final DtoMapper mapper;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public ApplicationDto apply(Long jobId, MultipartFile resume, UserPrincipal principal) {
        Job job = jobRepository.findById(jobId).orElseThrow();
        if (principal.getProfileId() == null)
            throw new AccessDeniedException("Candidates only can apply");
        Candidate cand = candidateRepository.findById(principal.getProfileId()).orElseThrow();
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")))
            throw new AccessDeniedException("Only candidates can apply");
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, cand.getId()))
            throw new IllegalArgumentException("Already applied for this job");
        if (resume == null || resume.isEmpty())
            throw new IllegalArgumentException("Resume is required");

        Application app = Application.builder()
                .job(job)
                .candidate(cand)
                .build();
        try {
            // Upload resume to Cloudinary
            String resumeUrl = cloudinaryService.uploadFile(resume, "career-portal/resumes");
            app.setResumeUrl(resumeUrl);
            app.setResumeFileName(resume.getOriginalFilename());
            app.setResumeContentType(resume.getContentType());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Resume upload failed: " + e.getMessage());
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload resume to Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload resume to Cloudinary: " + e.getMessage(), e);
        }
        app = applicationRepository.save(app);
        return mapper.toApplicationDto(app);
    }

    public List<ApplicationDto> getByJobId(Long jobId, UserPrincipal principal) {
        if (jobId == null) {
            throw new IllegalArgumentException("Job ID cannot be null");
        }
        if (principal == null) {
            throw new AccessDeniedException("Authentication required");
        }

        // First check if job exists and user has permission (using eager loading for job)
        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isCompany = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));

        if (!isAdmin && (!isCompany || !principal.getProfileId().equals(job.getCompany().getId()))) {
            throw new AccessDeniedException("Only job owner or admin can view applications");
        }

        // Now fetch applications with all relationships eagerly loaded
        return applicationRepository.findByJobIdWithRelationshipsOrderByAppliedAtDesc(jobId).stream()
                .map(mapper::toApplicationDto)
                .collect(Collectors.toList());
    }

    public Optional<String> getApplicationResumeUrl(Long applicationId, UserPrincipal principal) {
        Application a = applicationRepository.findById(applicationId).orElseThrow();
        Job job = a.getJob();
        if (!principal.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))
                && (!principal.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_COMPANY"))
                || !principal.getProfileId().equals(job.getCompany().getId())))
            throw new AccessDeniedException("Not authorized to download this resume");
        return Optional.ofNullable(a.getResumeUrl()).filter(url -> !url.isEmpty());
    }

    public Optional<String> getApplicationResumeFileName(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .map(Application::getResumeFileName)
                .filter(n -> n != null && !n.isEmpty());
    }

    public List<ApplicationDto> getByCandidateId(UserPrincipal principal) {
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")))
            throw new AccessDeniedException("Only candidates can view their applications");

        // Return empty list if candidate profile doesn't exist yet
        if (principal.getProfileId() == null) {
            return List.of();
        }

        // Verify candidate exists before querying
        if (!candidateRepository.existsById(principal.getProfileId())) {
            return List.of();
        }

        // Use eager loading to avoid LazyInitializationException
        return applicationRepository.findByCandidateIdWithRelationshipsOrderByAppliedAtDesc(principal.getProfileId()).stream()
                .map(mapper::toApplicationDto)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getCandidateStats(UserPrincipal principal) {
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE")))
            throw new AccessDeniedException("Only candidates can view their stats");

        // Return empty stats if candidate profile doesn't exist yet
        if (principal.getProfileId() == null) {
            Map<String, Long> emptyStats = new HashMap<>();
            emptyStats.put("totalApplications", 0L);
            emptyStats.put("appliedApplications", 0L);
            emptyStats.put("shortlistedApplications", 0L);
            emptyStats.put("interviewScheduledApplications", 0L);
            emptyStats.put("selectedApplications", 0L);
            emptyStats.put("rejectedApplications", 0L);
            return emptyStats;
        }

        List<Application> applications = applicationRepository.findByCandidateIdWithRelationshipsOrderByAppliedAtDesc(principal.getProfileId());

        // Use HashMap to avoid potential issues with Map.of() and ensure proper serialization
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalApplications", (long) applications.size());
        stats.put("appliedApplications", applications.stream()
                .filter(a -> a.getStatus() == Application.Status.APPLIED)
                .count());
        stats.put("shortlistedApplications", applications.stream()
                .filter(a -> a.getStatus() == Application.Status.SHORTLISTED)
                .count());
        stats.put("interviewScheduledApplications", applications.stream()
                .filter(a -> a.getStatus() == Application.Status.INTERVIEW_SCHEDULED)
                .count());
        stats.put("selectedApplications", applications.stream()
                .filter(a -> a.getStatus() == Application.Status.SELECTED)
                .count());
        stats.put("rejectedApplications", applications.stream()
                .filter(a -> a.getStatus() == Application.Status.REJECTED)
                .count());
        
        return stats;
    }

    @Transactional
    public ApplicationDto withdrawApplication(Long applicationId, UserPrincipal principal) {
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE"))
                || principal.getProfileId() == null)
            throw new AccessDeniedException("Only candidates can withdraw their applications");

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        // Check if the application belongs to the current user
        if (!application.getCandidate().getId().equals(principal.getProfileId()))
            throw new AccessDeniedException("You can only withdraw your own applications");

        // Check if application can be withdrawn
        if (application.getStatus() == Application.Status.SELECTED ||
            application.getStatus() == Application.Status.REJECTED)
            throw new IllegalArgumentException("This application cannot be withdrawn");

        // For now, we'll mark as REJECTED when withdrawn (or add WITHDRAWN status if needed)
        application.setStatus(Application.Status.REJECTED);
        application = applicationRepository.save(application);

        return mapper.toApplicationDto(application);
    }

    @Transactional
    public ApplicationDto updateApplicationStatus(Long applicationId, String newStatusStr, UserPrincipal principal) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        // Check if the user is authorized to update this application
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"))
                || !principal.getProfileId().equals(application.getJob().getCompany().getId())))
            throw new AccessDeniedException("Not authorized to update this application");

        // Parse and validate the status string
        Application.Status newStatus;
        try {
            newStatus = Application.Status.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + newStatusStr);
        }

        // Validate status transitions
        if (!isValidStatusTransition(application.getStatus(), newStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + application.getStatus() + " to " + newStatus);
        }

        application.setStatus(newStatus);
        application = applicationRepository.save(application);

        return mapper.toApplicationDto(application);
    }

    private boolean isValidStatusTransition(Application.Status current, Application.Status next) {
        // Handle null current status (treat as APPLIED)
        if (current == null) {
            current = Application.Status.APPLIED;
        }

        // Handle null next status
        if (next == null) {
            return false;
        }

        switch (current) {
            case APPLIED:
                // From APPLIED: can go to REJECTED or SHORTLISTED
                return next == Application.Status.REJECTED || next == Application.Status.SHORTLISTED;
            case SHORTLISTED:
                // From SHORTLISTED: can go to INTERVIEW_SCHEDULED or REJECTED
                return next == Application.Status.INTERVIEW_SCHEDULED || next == Application.Status.REJECTED;
            case INTERVIEW_SCHEDULED:
                // From INTERVIEW_SCHEDULED: can go to SELECTED or REJECTED
                return next == Application.Status.SELECTED || next == Application.Status.REJECTED;
            case REJECTED:
            case SELECTED:
                return false; // Terminal states - cannot transition from these
            default:
                return false;
        }
    }

    public List<ApplicationDto> getByCompanyId(UserPrincipal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication required");
        }

        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"))) {
            throw new AccessDeniedException("Only companies can view their applications");
        }

        // Return empty list if company profile doesn't exist yet
        if (principal.getProfileId() == null) {
            return List.of();
        }

        // Use eager loading to avoid LazyInitializationException
        return applicationRepository.findByCompanyIdWithRelationshipsOrderByAppliedAtDesc(principal.getProfileId()).stream()
                .map(mapper::toApplicationDto)
                .collect(Collectors.toList());
    }
}
