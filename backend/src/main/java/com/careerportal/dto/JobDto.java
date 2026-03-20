package com.careerportal.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class JobDto {

    private Long id;
    private Long companyId;
    private String companyName;
    private String title;
    private String description;
    private String location;
    private BigDecimal salary;
    private String category;
    private Instant postedOn;
    private Long applicationCount;
}
