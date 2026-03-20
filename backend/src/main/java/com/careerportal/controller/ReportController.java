package com.careerportal.controller;

import com.careerportal.dto.CandidateDto;
import com.careerportal.dto.CompanyDto;
import com.careerportal.security.UserPrincipal;
import com.careerportal.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/candidate")
    public ResponseEntity<List<CandidateDto>> candidateReport(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reportService.getCandidateReport(search, principal));
    }

    @GetMapping("/candidate/export")
    public ResponseEntity<byte[]> exportCandidateReport(
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] excel = reportService.exportCandidateReportExcel(search, principal);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=candidate-report.xlsx")
                .body(excel);
    }

    @GetMapping("/company")
    public ResponseEntity<List<CompanyDto>> companyReport(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String after,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(reportService.getCompanyReport(name, email, industry, after, principal));
    }

    @GetMapping("/company/export")
    public ResponseEntity<byte[]> exportCompanyReport(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String after,
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] excel = reportService.exportCompanyReportExcel(name, email, industry, after, principal);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=company-report.xlsx")
                .body(excel);
    }
}
