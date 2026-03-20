package com.careerportal.dto;

import lombok.Data;

@Data
public class CompanyUpdateRequest {

    private String companyName;
    private String industry;
    private String companySize;
    private String headquarters;
    private String companyType;
    private Integer founded;
    private String specialities;
    private String address;
    private String companyPhone;
}
