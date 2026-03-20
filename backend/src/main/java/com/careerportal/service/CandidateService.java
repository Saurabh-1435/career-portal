package com.careerportal.service;

import com.careerportal.dto.CandidateDto;
import com.careerportal.dto.CandidateUpdateRequest;
import com.careerportal.entity.Candidate;
import com.careerportal.repository.CandidateRepository;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final DtoMapper mapper;
    private final CloudinaryService cloudinaryService;

    public CandidateDto getById(Long id, UserPrincipal principal) {
        Candidate c = candidateRepository.findByIdWithUser(id).orElseThrow();
        ensureCanAccessCandidate(c, principal);
        return mapper.toCandidateDto(c);
    }

    public CandidateDto getByUserId(Long userId, UserPrincipal principal) {
        Candidate c = candidateRepository.findByUserIdWithUser(userId).orElseThrow();
        ensureCanAccessCandidate(c, principal);
        return mapper.toCandidateDto(c);
    }

    public Optional<String> getResumeUrl(Long candidateId, UserPrincipal principal) {
        Candidate c = candidateRepository.findById(candidateId).orElseThrow();
        ensureCanAccessCandidate(c, principal);
        return Optional.ofNullable(c.getResumeUrl()).filter(url -> !url.isEmpty());
    }

    public Optional<String> getResumeFileName(Long candidateId) {
        return candidateRepository.findById(candidateId)
                .map(Candidate::getResumeFileName)
                .filter(n -> n != null && !n.isEmpty());
    }

    public Optional<String> getPhotoUrl(Long candidateId, UserPrincipal principal) {
        Candidate c = candidateRepository.findById(candidateId).orElseThrow();
        ensureCanAccessCandidate(c, principal);
        return Optional.ofNullable(c.getPhotoUrl()).filter(url -> !url.isEmpty());
    }

    @Transactional
    public CandidateDto update(Long candidateId, CandidateUpdateRequest req, UserPrincipal principal) {
        Candidate c = candidateRepository.findById(candidateId).orElseThrow();
        ensureCanEditCandidate(c, principal);

        if (req.getName() != null) c.setName(req.getName());
        if (req.getMobile() != null) c.setMobile(req.getMobile());
        if (req.getDob() != null) c.setDob(req.getDob());
        if (req.getGender() != null) c.setGender(req.getGender());
        if (req.getEducation() != null) c.setEducation(req.getEducation());
        if (req.getWorkExperience() != null) c.setWorkExperience(req.getWorkExperience());
        if (req.getSkills() != null) c.setSkills(req.getSkills());

        if (Boolean.TRUE.equals(req.getClearResume())) {
            // Delete old resume from Cloudinary if exists
            if (c.getResumeUrl() != null && !c.getResumeUrl().isEmpty()) {
                try {
                    String publicId = cloudinaryService.extractPublicId(c.getResumeUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteFile(publicId);
                    }
                } catch (Exception e) {
                    // Log error but continue - non-critical operation
                }
            }
            c.setResumeUrl(null);
            c.setResumeFileName(null);
            c.setResumeContentType(null);
        }
        if (Boolean.TRUE.equals(req.getClearPhoto())) {
            // Delete old photo from Cloudinary if exists
            if (c.getPhotoUrl() != null && !c.getPhotoUrl().isEmpty()) {
                try {
                    String publicId = cloudinaryService.extractPublicId(c.getPhotoUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteFile(publicId);
                    }
                } catch (Exception e) {
                    // Log error but continue - non-critical operation
                }
            }
            c.setPhotoUrl(null);
            c.setPhotoFileName(null);
            c.setPhotoContentType(null);
        }
        MultipartFile resume = req.getResume();
        if (resume != null && !resume.isEmpty()) {
            try {
                // Delete old resume if exists
                if (c.getResumeUrl() != null && !c.getResumeUrl().isEmpty()) {
                    String publicId = cloudinaryService.extractPublicId(c.getResumeUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteFile(publicId);
                    }
                }
                // Upload new resume to Cloudinary
                String resumeUrl = cloudinaryService.uploadFile(resume, "career-portal/resumes");
                c.setResumeUrl(resumeUrl);
                c.setResumeFileName(resume.getOriginalFilename());
                c.setResumeContentType(resume.getContentType());
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload resume to Cloudinary", e);
            }
        }
        MultipartFile photo = req.getPhoto();
        if (photo != null && !photo.isEmpty()) {
            try {
                // Delete old photo if exists
                if (c.getPhotoUrl() != null && !c.getPhotoUrl().isEmpty()) {
                    String publicId = cloudinaryService.extractPublicId(c.getPhotoUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteFile(publicId);
                    }
                }
                // Upload new photo to Cloudinary
                String photoUrl = cloudinaryService.uploadFile(photo, "career-portal/photos");
                c.setPhotoUrl(photoUrl);
                c.setPhotoFileName(photo.getOriginalFilename());
                c.setPhotoContentType(photo.getContentType());
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload photo to Cloudinary", e);
            }
        }
        c = candidateRepository.save(c);
        return mapper.toCandidateDto(c);
    }

    private void ensureCanAccessCandidate(Candidate c, UserPrincipal principal) {
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE"))
                && principal.getProfileId() != null && principal.getProfileId().equals(c.getId()))
            return;
        throw new AccessDeniedException("Not authorized to access this candidate");
    }

    private void ensureCanEditCandidate(Candidate c, UserPrincipal principal) {
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CANDIDATE"))
                && principal.getProfileId() != null && principal.getProfileId().equals(c.getId()))
            return;
        throw new AccessDeniedException("Not authorized to edit this candidate");
    }
}
