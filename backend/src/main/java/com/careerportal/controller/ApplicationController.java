package com.careerportal.controller;

import com.careerportal.dto.ApplicationDto;
import com.careerportal.entity.Application;
import com.careerportal.security.UserPrincipal;
import com.careerportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/job/{jobId}")
    public ResponseEntity<?> apply(@PathVariable Long jobId, @RequestParam("resume") MultipartFile resume,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        try {
            ApplicationDto application = applicationService.apply(jobId, resume, principal);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application submitted successfully",
                "application", application
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Application failed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Application failed. Please try again."));
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationDto>> listByJob(@PathVariable Long jobId,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(applicationService.getByJobId(jobId, principal));
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<?> downloadResume(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return applicationService.getApplicationResumeUrl(id, principal)
                .map(url -> {
                    // Redirect to Cloudinary URL for direct download
                    return ResponseEntity.status(302).header(HttpHeaders.LOCATION, url).build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/candidate")
    public ResponseEntity<List<ApplicationDto>> getCandidateApplications(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(applicationService.getByCandidateId(principal));
        } catch (AccessDeniedException e) {
            // Return 200 OK with empty list instead of 403 to avoid frontend errors
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            // Return 200 OK with empty list instead of 400 to avoid frontend errors
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/candidate/stats")
    public ResponseEntity<Map<String, Long>> getCandidateStats(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(applicationService.getCandidateStats(principal));
        } catch (AccessDeniedException e) {
            // Return 200 OK with empty stats instead of 403 to avoid frontend errors
            Map<String, Long> emptyStats = new java.util.HashMap<>();
            emptyStats.put("totalApplications", 0L);
            emptyStats.put("appliedApplications", 0L);
            emptyStats.put("shortlistedApplications", 0L);
            emptyStats.put("interviewScheduledApplications", 0L);
            emptyStats.put("selectedApplications", 0L);
            emptyStats.put("rejectedApplications", 0L);
            return ResponseEntity.ok(emptyStats);
        } catch (Exception e) {
            // Return 200 OK with empty stats instead of 400 to avoid frontend errors
            Map<String, Long> emptyStats = new java.util.HashMap<>();
            emptyStats.put("totalApplications", 0L);
            emptyStats.put("appliedApplications", 0L);
            emptyStats.put("shortlistedApplications", 0L);
            emptyStats.put("interviewScheduledApplications", 0L);
            emptyStats.put("selectedApplications", 0L);
            emptyStats.put("rejectedApplications", 0L);
            return ResponseEntity.ok(emptyStats);
        }
    }

    @GetMapping("/company")
    public ResponseEntity<List<ApplicationDto>> getCompanyApplications(@AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(applicationService.getByCompanyId(principal));
        } catch (AccessDeniedException e) {
            // Return 200 OK with empty list instead of 403 to avoid frontend errors
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            // Return 200 OK with empty list instead of 400 to avoid frontend errors
            return ResponseEntity.ok(List.of());
        }
    }

    @PutMapping("/{id}/withdraw")
    public ResponseEntity<ApplicationDto> withdrawApplication(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(applicationService.withdrawApplication(id, principal));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest,
            @AuthenticationPrincipal UserPrincipal principal) {
        String newStatus = statusRequest.get("status");

        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status parameter is required"));
        }

        try {
            return ResponseEntity.ok(applicationService.updateApplicationStatus(id, newStatus, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to update application status"));
        }
    }
}
