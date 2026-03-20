package com.careerportal.controller;

import com.careerportal.dto.AuthResponse;
import com.careerportal.dto.CompanyRegisterRequest;
import com.careerportal.dto.LoginRequest;
import com.careerportal.entity.Candidate;
import com.careerportal.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<?> registerCandidate(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String passwordConfirmation,
            @RequestParam String name,
            @RequestParam String mobile,
            @RequestParam Candidate.Status status,
            @RequestParam Candidate.Gender gender,
            @RequestParam LocalDate dob,
            @RequestParam String education,
            @RequestParam(required = false) String skills,
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        if (!password.equals(passwordConfirmation))
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        try {
            return ResponseEntity.ok(authService.registerCandidate(
                    username, email, password, name, mobile, status, gender, dob,
                    education, skills, resume, photo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register/company")
    public ResponseEntity<?> registerCompany(@Valid @RequestBody CompanyRegisterRequest req) {
        try {
            return ResponseEntity.ok(authService.registerCompany(req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
