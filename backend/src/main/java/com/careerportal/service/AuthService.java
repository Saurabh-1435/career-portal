package com.careerportal.service;

import com.careerportal.dto.*;
import com.careerportal.entity.Candidate;
import com.careerportal.entity.Company;
import com.careerportal.entity.User;
import com.careerportal.repository.*;
import com.careerportal.security.JwtUtil;
import com.careerportal.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword()));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtUtil.generateToken(auth);
        Set<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());
        return AuthResponse.builder()
                .token(token)
                .username(principal.getUsername())
                .email(principal.getEmail())
                .roles(roles)
                .profileId(principal.getProfileId())
                .build();
    }

    @Transactional
    public AuthResponse registerCandidate(String username, String email, String password,
                                          String name, String mobile, Candidate.Status status,
                                          Candidate.Gender gender, java.time.LocalDate dob,
                                          String education, String skills,
                                          MultipartFile resume, MultipartFile photo) {
        if (userRepository.existsByUsername(username))
            throw new IllegalArgumentException("Username already exists");
        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("Email already exists");
        // Resume is optional for registration, can be uploaded later
        // if (resume == null || resume.isEmpty())
        //     throw new IllegalArgumentException("Resume is required");

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .roles(Set.of(User.Role.ROLE_CANDIDATE))
                .build();
        user = userRepository.save(user);

        Candidate c = Candidate.builder()
                .user(user)
                .name(name)
                .mobile(mobile)
                .status(status)
                .gender(gender)
                .dob(dob)
                .education(education)
                .skills(skills != null ? skills : "")
                .workExperience(null)
                .build();
        if (resume != null && !resume.isEmpty()) {
            try {
                // Upload resume to Cloudinary
                String resumeUrl = cloudinaryService.uploadFile(resume, "career-portal/resumes");
                c.setResumeUrl(resumeUrl);
                c.setResumeFileName(resume.getOriginalFilename());
                c.setResumeContentType(resume.getContentType());
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload resume to Cloudinary", e);
            }
        }
        if (photo != null && !photo.isEmpty()) {
            try {
                // Upload photo to Cloudinary
                String photoUrl = cloudinaryService.uploadFile(photo, "career-portal/photos");
                c.setPhotoUrl(photoUrl);
                c.setPhotoFileName(photo.getOriginalFilename());
                c.setPhotoContentType(photo.getContentType());
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload photo to Cloudinary", e);
            }
        }
        c = candidateRepository.save(c);

        // Don't authenticate immediately - user needs to login after registration
        return AuthResponse.builder()
                .token(null) // No token for registration response
                .username(username)
                .email(email)
                .roles(Set.of("ROLE_CANDIDATE"))
                .profileId(c.getId())
                .message("Registration successful. Please login to continue.")
                .build();
    }

    @Transactional
    public AuthResponse registerCompany(CompanyRegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already exists");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already exists");
        if (!req.getPassword().equals(req.getPasswordConfirmation()))
            throw new IllegalArgumentException("Passwords do not match");

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .roles(Set.of(User.Role.ROLE_COMPANY))
                .build();
        user = userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .companyName(req.getCompanyName())
                .industry(req.getIndustry())
                .companySize(req.getCompanySize())
                .headquarters(req.getHeadquarters())
                .companyType(req.getCompanyType())
                .founded(req.getFounded())
                .specialities(req.getSpecialities() != null ? req.getSpecialities() : "")
                .address(req.getAddress() != null ? req.getAddress() : "")
                .companyPhone(req.getCompanyPhone() != null ? req.getCompanyPhone() : "")
                .status(Company.Status.PENDING)
                .build();
        company = companyRepository.save(company);

        // Don't authenticate immediately - user needs to login after registration
        return AuthResponse.builder()
                .token(null) // No token for registration response
                .username(req.getUsername())
                .email(req.getEmail())
                .roles(Set.of("ROLE_COMPANY"))
                .profileId(company.getId())
                .message("Registration successful. Please login to continue.")
                .build();
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email address"));
        // In a real application, you would send an email here
        // For now, we'll just validate that the email exists
    }
}
