package com.careerportal.controller;

import com.careerportal.dto.JobDto;
import com.careerportal.dto.JobRequest;
import com.careerportal.security.UserPrincipal;
import com.careerportal.service.JobService;
import com.careerportal.repository.JobRepository;
import com.careerportal.repository.CompanyRepository;
import com.careerportal.repository.CandidateRepository;
import com.careerportal.repository.ApplicationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<JobDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String industry,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobService.findAllForPrincipalWithFilters(principal, search, location, industry));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(jobService.getById(id, principal));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody JobRequest req, @AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(jobService.create(req, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody JobRequest req,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(jobService.update(id, req, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        jobService.delete(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        long totalJobs = jobRepository.count();
        long totalCompanies = companyRepository.count();
        long totalCandidates = candidateRepository.count();

        // Calculate success rate based on application activity
        // Formula: base 85% + (applications/jobs ratio * 10), capped at 95%
        long totalApplications = applicationRepository.count();
        int successRate = 85; // base success rate
        if (totalJobs > 0) {
            double applicationRatio = (double) totalApplications / totalJobs;
            successRate = (int) Math.min(95, 85 + (applicationRatio * 10));
        }

        return ResponseEntity.ok(Map.of(
            "totalJobs", totalJobs,
            "totalCompanies", totalCompanies,
            "totalCandidates", totalCandidates,
            "successRate", successRate
        ));
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<Map<String, Object>>> getPublicCategories() {
        // Get all jobs with their categories
        List<Map<String, Object>> categories = jobRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                job -> job.getCategory(),
                Collectors.counting()
            ))
            .entrySet().stream()
            .map(entry -> {
                Map<String, Object> category = new java.util.HashMap<>();
                category.put("name", entry.getKey() != null ? entry.getKey() : "Other");
                category.put("count", entry.getValue());
                category.put("icon", getCategoryIcon(entry.getKey()));
                return category;
            })
            .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
            .collect(Collectors.toList());

        // Always include "All Jobs" category
        Map<String, Object> allJobsCategory = new java.util.HashMap<>();
        allJobsCategory.put("name", "All Jobs");
        allJobsCategory.put("count", jobRepository.count());
        allJobsCategory.put("icon", "📋");
        categories.add(0, allJobsCategory);

        return ResponseEntity.ok(categories);
    }

    private String getCategoryIcon(String industry) {
        if (industry == null) return "🏢";
        String lowerIndustry = industry.toLowerCase();
        if (lowerIndustry.contains("technology") || lowerIndustry.contains("software")) return "💻";
        if (lowerIndustry.contains("design") || lowerIndustry.contains("creative")) return "🎨";
        if (lowerIndustry.contains("marketing") || lowerIndustry.contains("advertising")) return "📢";
        if (lowerIndustry.contains("finance") || lowerIndustry.contains("banking")) return "💰";
        if (lowerIndustry.contains("healthcare") || lowerIndustry.contains("medical")) return "🏥";
        if (lowerIndustry.contains("education")) return "📚";
        if (lowerIndustry.contains("retail") || lowerIndustry.contains("e-commerce")) return "🛒";
        if (lowerIndustry.contains("manufacturing")) return "🏭";
        if (lowerIndustry.contains("consulting")) return "💼";
        return "🏢"; // Default icon
    }
}
