package com.careerportal.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CompanyRegisterRequest {

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
    private String companyName;

    @NotBlank
    private String industry;

    @NotBlank
    private String companySize;

    @NotBlank
    private String headquarters;

    @NotBlank
    private String companyType;

    @NotNull
    @Min(1800)
    @Max(2100)
    private Integer founded;

    private String specialities;

    private String address;

    private String companyPhone;
}
