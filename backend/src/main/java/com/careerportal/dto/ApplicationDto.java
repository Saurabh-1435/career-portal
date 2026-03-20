package com.careerportal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ApplicationDto {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String resumeFileName;
    private String resumeUrl;
    private boolean hasResume;
    private Instant appliedAt;
    private String status;
    private String jobLocation;
    private String companyName;
}
