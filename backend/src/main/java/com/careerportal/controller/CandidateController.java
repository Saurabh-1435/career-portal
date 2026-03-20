package com.careerportal.controller;

import com.careerportal.dto.CandidateDto;
import com.careerportal.dto.CandidateUpdateRequest;
import com.careerportal.security.UserPrincipal;
import com.careerportal.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(candidateService.getById(id, principal));
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateDto> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getProfileId() == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(candidateService.getById(principal.getProfileId(), principal));
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<?> downloadResume(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return candidateService.getResumeUrl(id, principal)
                .map(url -> {
                    // Redirect to Cloudinary URL for direct download
                    return ResponseEntity.status(302).header(HttpHeaders.LOCATION, url).build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return candidateService.getPhotoUrl(id, principal)
                .map(url -> {
                    // Return the Cloudinary URL - frontend can display directly
                    return ResponseEntity.ok().body(Map.of("url", url));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestParam(required = false) String name,
                                    @RequestParam(required = false) String mobile,
                                    @RequestParam(required = false) java.time.LocalDate dob,
                                    @RequestParam(required = false) com.careerportal.entity.Candidate.Gender gender,
                                    @RequestParam(required = false) String education,
                                    @RequestParam(required = false) String workExperience,
                                    @RequestParam(required = false) String skills,
                                    @RequestParam(value = "resume", required = false) MultipartFile resume,
                                    @RequestParam(value = "photo", required = false) MultipartFile photo,
                                    @RequestParam(value = "clearResume", required = false) Boolean clearResume,
                                    @RequestParam(value = "clearPhoto", required = false) Boolean clearPhoto,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        CandidateUpdateRequest req = new CandidateUpdateRequest();
        req.setName(name);
        req.setMobile(mobile);
        req.setDob(dob);
        req.setGender(gender);
        req.setEducation(education);
        req.setWorkExperience(workExperience);
        req.setSkills(skills);
        req.setResume(resume);
        req.setPhoto(photo);
        req.setClearResume(clearResume);
        req.setClearPhoto(clearPhoto);
        try {
            return ResponseEntity.ok(candidateService.update(id, req, principal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
