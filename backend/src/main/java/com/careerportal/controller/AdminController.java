package com.careerportal.controller;

import com.careerportal.dto.*;
import com.careerportal.service.AdminService;
import com.careerportal.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminService.AdminDashboardStats> dashboardStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getDashboardStats(principal));
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<CandidateDto>> listCandidates(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getAllCandidates(principal));
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDto>> listCompanies(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getAllCompanies(principal));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobDto>> listJobs(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getAllJobs(principal));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationDto>> listApplications(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getAllApplications(principal));
    }

    @DeleteMapping("/candidates/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteCandidate(id, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteCompany(id, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteJob(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getAllUsers(principal));
    }

    @PutMapping("/users/{id}/roles")
    public ResponseEntity<UserDto> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.updateUserRoles(id, request, principal));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        adminService.deleteUser(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<Map<String, String>> changeUserPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordRequest,
            @AuthenticationPrincipal UserPrincipal principal) {
        String newPassword = passwordRequest.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password is required"));
        }
        if (!newPassword.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters with uppercase, lowercase, number and special character"));
        }
        try {
            adminService.changeUserPassword(id, newPassword, principal);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/companies/{id}/approve")
    public ResponseEntity<CompanyDto> approveCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(adminService.approveCompany(id, principal));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/companies/{id}/reject")
    public ResponseEntity<CompanyDto> rejectCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(adminService.rejectCompany(id, principal));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
