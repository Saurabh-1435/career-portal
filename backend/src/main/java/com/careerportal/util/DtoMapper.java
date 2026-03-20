package com.careerportal.util;

import com.careerportal.dto.*;
import com.careerportal.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public CandidateDto toCandidateDto(Candidate c) {
        if (c == null) return null;
        return CandidateDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .email(c.getUser().getEmail())
                .name(c.getName())
                .mobile(c.getMobile())
                .status(c.getStatus())
                .gender(c.getGender())
                .dob(c.getDob())
                .education(c.getEducation())
                .skills(c.getSkills())
                .workExperience(c.getWorkExperience())
                .resumeFileName(c.getResumeFileName())
                .photoFileName(c.getPhotoFileName())
                .hasResume(c.getResumeUrl() != null && !c.getResumeUrl().isEmpty())
                .hasPhoto(c.getPhotoUrl() != null && !c.getPhotoUrl().isEmpty())
                .resumeUrl(c.getResumeUrl())
                .photoUrl(c.getPhotoUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }

    public CompanyDto toCompanyDto(Company c) {
        if (c == null) return null;
        return CompanyDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .username(c.getUser().getUsername())
                .email(c.getUser().getEmail())
                .companyName(c.getCompanyName())
                .industry(c.getIndustry())
                .companySize(c.getCompanySize())
                .headquarters(c.getHeadquarters())
                .companyType(c.getCompanyType())
                .founded(c.getFounded())
                .specialities(c.getSpecialities())
                .address(c.getAddress())
                .companyPhone(c.getCompanyPhone())
                .status(c.getStatus() != null ? c.getStatus().toString() : "PENDING")
                .createdAt(c.getCreatedAt())
                .build();
    }

    public JobDto toJobDto(Job j, Long applicationCount) {
        if (j == null) return null;

        // Defensive programming for company relationship
        Long companyId = null;
        String companyName = null;
        if (j.getCompany() != null) {
            companyId = j.getCompany().getId();
            companyName = j.getCompany().getCompanyName();
        }

        return JobDto.builder()
                .id(j.getId())
                .companyId(companyId)
                .companyName(companyName != null ? companyName : "Unknown Company")
                .title(j.getTitle() != null ? j.getTitle() : "Untitled Job")
                .description(j.getDescription() != null ? j.getDescription() : "No description available")
                .location(j.getLocation() != null ? j.getLocation() : "Location not specified")
                .salary(j.getSalary())
                .category(j.getCategory() != null ? j.getCategory() : "Uncategorized")
                .postedOn(j.getPostedOn())
                .applicationCount(applicationCount != null ? applicationCount : 0L)
                .build();
    }

    public ApplicationDto toApplicationDto(Application a) {
        if (a == null) return null;

        // Defensive programming for nested relationships
        Long jobId = null;
        String jobTitle = null;
        String jobLocation = null;
        String companyName = null;

        if (a.getJob() != null) {
            jobId = a.getJob().getId();
            jobTitle = a.getJob().getTitle();
            jobLocation = a.getJob().getLocation();

            if (a.getJob().getCompany() != null) {
                companyName = a.getJob().getCompany().getCompanyName();
            }
        }

        Long candidateId = null;
        String candidateName = null;
        String candidateEmail = null;

        if (a.getCandidate() != null) {
            candidateId = a.getCandidate().getId();
            candidateName = a.getCandidate().getName();

            if (a.getCandidate().getUser() != null) {
                candidateEmail = a.getCandidate().getUser().getEmail();
            }
        }

        return ApplicationDto.builder()
                .id(a.getId())
                .jobId(jobId)
                .jobTitle(jobTitle != null ? jobTitle : "Unknown Job")
                .candidateId(candidateId)
                .candidateName(candidateName != null ? candidateName : "Unknown Candidate")
                .candidateEmail(candidateEmail != null ? candidateEmail : "No email available")
                .resumeFileName(a.getResumeFileName())
                .hasResume(a.getResumeUrl() != null && !a.getResumeUrl().isEmpty())
                .resumeUrl(a.getResumeUrl())
                .appliedAt(a.getAppliedAt())
                .status(a.getStatus() != null ? a.getStatus().name() : "APPLIED")
                .jobLocation(jobLocation != null ? jobLocation : "Location not specified")
                .companyName(companyName != null ? companyName : "Unknown Company")
                .build();
    }
}
