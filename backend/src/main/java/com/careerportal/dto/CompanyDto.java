package com.careerportal.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CompanyDto {

    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String companyName;
    private String industry;
    private String companySize;
    private String headquarters;
    private String companyType;
    private Integer founded;
    private String specialities;
    private String address;
    private String companyPhone;
    private String status;
    private Instant createdAt;
}
