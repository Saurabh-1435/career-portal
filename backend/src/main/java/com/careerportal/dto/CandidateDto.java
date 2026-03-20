package com.careerportal.dto;

import com.careerportal.entity.Candidate;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class CandidateDto {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String name;
    private String mobile;
    private Candidate.Status status;
    private Candidate.Gender gender;
    private LocalDate dob;
    private String education;
    private String skills;
    private String workExperience;
    private String resumeFileName;
    private String photoFileName;
    private String resumeUrl;
    private String photoUrl;
    private boolean hasResume;
    private boolean hasPhoto;
    private Instant createdAt;
}
