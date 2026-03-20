package com.careerportal.dto;

import com.careerportal.entity.Candidate;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class CandidateRegisterRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "Password must have min 8 chars, uppercase, lowercase, number, special")
    private String password;

    @NotBlank
    private String passwordConfirmation;

    @NotBlank
    private String name;

    @NotBlank
    private String mobile;

    @NotNull
    private Candidate.Status status;

    @NotNull
    private Candidate.Gender gender;

    @NotNull
    private LocalDate dob;

    @NotBlank
    private String education;

    private String skills;

    private MultipartFile resume;

    private MultipartFile photo;
}
