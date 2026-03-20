package com.careerportal.service;

import com.careerportal.dto.JobDto;
import com.careerportal.dto.JobRequest;
import com.careerportal.entity.Company;
import com.careerportal.entity.Job;
import com.careerportal.repository.ApplicationRepository;
import com.careerportal.repository.CompanyRepository;
import com.careerportal.repository.JobRepository;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Stream;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final DtoMapper mapper;

    public List<JobDto> findAllForPrincipal(UserPrincipal principal) {
        boolean admin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean company = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
        if (company && !admin && principal.getProfileId() != null) {
            List<Job> companyJobs = jobRepository.findByCompanyIdOrderByPostedOnDesc(principal.getProfileId());
            return companyJobs.stream()
                    .map(j -> {
                        long count = applicationRepository.countByJobId(j.getId());
                        return mapper.toJobDto(j, count);
                    })
                    .collect(Collectors.toList());
        }
        List<Job> all = jobRepository.findAllWithCompany();
        return all.stream()
                .filter(j -> admin || j.getCompany().getStatus() == Company.Status.APPROVED)
                .sorted((a, b) -> b.getPostedOn().compareTo(a.getPostedOn()))
                .map(j -> {
                    long count = applicationRepository.countByJobId(j.getId());
                    return mapper.toJobDto(j, count);
                })
                .collect(Collectors.toList());
    }

    public List<JobDto> findAllForPrincipalWithFilters(UserPrincipal principal, String search, String location, String industry) {
        boolean admin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean company = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));

        Stream<Job> jobStream;
        if (company && !admin && principal.getProfileId() != null) {
            // Company user - show only their jobs
            jobStream = jobRepository.findByCompanyIdOrderByPostedOnDesc(principal.getProfileId()).stream();
        } else {
            // Admin or candidate - show all jobs, but filter by company status for non-admins
            jobStream = jobRepository.findAllWithCompany().stream();
            if (!admin) {
                jobStream = jobStream.filter(j -> j.getCompany().getStatus() == Company.Status.APPROVED);
            }
        }

        // Apply filters
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            jobStream = jobStream.filter(job ->
                job.getTitle().toLowerCase().contains(searchLower) ||
                job.getDescription().toLowerCase().contains(searchLower) ||
                job.getCompany().getCompanyName().toLowerCase().contains(searchLower)
            );
        }

        if (location != null && !location.trim().isEmpty()) {
            String locationLower = location.toLowerCase();
            jobStream = jobStream.filter(job ->
                job.getLocation().toLowerCase().contains(locationLower) ||
                (locationLower.contains("remote") && job.getLocation().toLowerCase().contains("remote"))
            );
        }

        if (industry != null && !industry.trim().isEmpty()) {
            String industryLower = industry.toLowerCase();
            jobStream = jobStream.filter(job ->
                job.getCategory() != null && job.getCategory().toLowerCase().contains(industryLower)
            );
        }

        return jobStream
                .sorted((a, b) -> b.getPostedOn().compareTo(a.getPostedOn()))
                .map(j -> {
                    long count = applicationRepository.countByJobId(j.getId());
                    return mapper.toJobDto(j, count);
                })
                .collect(Collectors.toList());
    }

    public JobDto getById(Long id, UserPrincipal principal) {
        if (id == null) {
            throw new IllegalArgumentException("Job ID cannot be null");
        }

        Job job = jobRepository.findByIdWithCompany(id)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + id));

        // Validate job data integrity
        if (job.getCompany() == null) {
            throw new IllegalStateException("Job with ID " + id + " has no associated company");
        }
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            throw new IllegalStateException("Job with ID " + id + " has no title");
        }

        // Check if user can view this job (only approved companies' jobs for non-admins)
        if (principal != null) {
            boolean isAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && job.getCompany().getStatus() != Company.Status.APPROVED) {
                throw new AccessDeniedException("Job is not available for viewing");
            }
        }

        long applicationCount = applicationRepository.countByJobId(job.getId());
        return mapper.toJobDto(job, applicationCount);
    }

    @Transactional
    public JobDto create(JobRequest req, UserPrincipal principal) {
        Long companyId;
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isCompany = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
        if (isAdmin && req.getCompanyId() != null) {
            companyId = req.getCompanyId();
        } else if (isCompany && principal.getProfileId() != null) {
            companyId = principal.getProfileId();
        } else {
            throw new AccessDeniedException("Only companies or admins can post jobs");
        }
        Company company = companyRepository.findById(companyId).orElseThrow();
        
        // Only approved companies can post jobs (unless admin is posting on their behalf)
        if (!isAdmin && company.getStatus() != Company.Status.APPROVED) {
            throw new AccessDeniedException("Your company registration must be approved before you can post jobs");
        }
        
        Job job = Job.builder()
                .company(company)
                .title(req.getTitle())
                .description(req.getDescription())
                .location(req.getLocation())
                .salary(req.getSalary())
                .category(req.getCategory())
                .build();
        job = jobRepository.save(job);
        return mapper.toJobDto(job, 0L);
    }

    @Transactional
    public JobDto update(Long jobId, JobRequest req, UserPrincipal principal) {
        Job j = jobRepository.findById(jobId).orElseThrow();
        ensureCanEditJob(j, principal);
        j.setTitle(req.getTitle());
        j.setDescription(req.getDescription());
        j.setLocation(req.getLocation());
        j.setSalary(req.getSalary());
        j.setCategory(req.getCategory());
        j = jobRepository.save(j);
        long count = applicationRepository.countByJobId(j.getId());
        return mapper.toJobDto(j, count);
    }

    @Transactional
    public void delete(Long jobId, UserPrincipal principal) {
        Job j = jobRepository.findById(jobId).orElseThrow();
        ensureCanEditJob(j, principal);
        jobRepository.delete(j);
    }

    private void ensureCanEditJob(Job j, UserPrincipal principal) {
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"))
                && principal.getProfileId() != null && principal.getProfileId().equals(j.getCompany().getId()))
            return;
        throw new AccessDeniedException("Not authorized to edit this job");
    }
}
