package com.careerportal.dto;

import com.careerportal.entity.Candidate;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class CandidateUpdateRequest {

    private String name;
    private String mobile;
    private LocalDate dob;
    private Candidate.Gender gender;
    private String education;
    private String workExperience;
    private String skills;
    private MultipartFile resume;
    private MultipartFile photo;
    private Boolean clearResume;
    private Boolean clearPhoto;
}
