package com.careerportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ApplyRequest {

    @NotNull
    private MultipartFile resume;
}
