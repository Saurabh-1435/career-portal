package com.careerportal.controller;

import com.careerportal.dto.CompanyDto;
import com.careerportal.dto.CompanyUpdateRequest;
import com.careerportal.security.UserPrincipal;
import com.careerportal.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(companyService.getById(id, principal));
    }

    @GetMapping("/me")
    public ResponseEntity<CompanyDto> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getProfileId() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(companyService.getById(principal.getProfileId(), principal));
    }

    @GetMapping
    public ResponseEntity<List<CompanyDto>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(companyService.listAll(principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CompanyUpdateRequest req,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        try {
            return ResponseEntity.ok(companyService.update(id, req, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
