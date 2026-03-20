package com.careerportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {
    private String response;
    private double confidence;
    private long processingTime;
    private List<String> suggestedActions;
    private Map<String, Object> metadata;
    private List<String> followUpQuestions;
}