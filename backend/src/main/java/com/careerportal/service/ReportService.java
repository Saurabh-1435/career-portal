package com.careerportal.service;

import com.careerportal.dto.CandidateDto;
import com.careerportal.dto.CompanyDto;
import com.careerportal.entity.Candidate;
import com.careerportal.entity.Company;
import com.careerportal.repository.ApplicationRepository;
import com.careerportal.repository.CandidateRepository;
import com.careerportal.repository.CompanyRepository;
import com.careerportal.repository.JobRepository;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final DtoMapper mapper;

    public List<CandidateDto> getCandidateReport(String search, UserPrincipal principal) {
        boolean admin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (admin) {
            List<Candidate> list = (search == null || search.isBlank())
                    ? candidateRepository.findAllWithUser()
                    : candidateRepository.searchByNameOrEmail(search.trim());
            return list.stream().map(mapper::toCandidateDto).collect(Collectors.toList());
        }
        boolean company = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
        if (company && principal.getProfileId() != null) {
            Set<Long> applicantIds = applicationRepository.findByJob_Company_Id(principal.getProfileId()).stream()
                    .map(a -> a.getCandidate().getId())
                    .collect(Collectors.toSet());
            List<Candidate> all = (search == null || search.isBlank())
                    ? candidateRepository.findAllWithUser()
                    : candidateRepository.searchByNameOrEmail(search.trim());
            return all.stream()
                    .filter(c -> applicantIds.contains(c.getId()))
                    .map(mapper::toCandidateDto)
                    .collect(Collectors.toList());
        }
        throw new AccessDeniedException("Not authorized to view candidate report");
    }

    public List<CompanyDto> getCompanyReport(String name, String email, String industry, String after, UserPrincipal principal) {
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            throw new AccessDeniedException("Only admins can view company report");
        Instant afterInstant = null;
        if (after != null && !after.isBlank()) {
            try {
                afterInstant = java.time.LocalDate.parse(after).atStartOfDay(ZoneId.of("UTC")).toInstant();
            } catch (Exception ignored) {}
        }
        boolean hasAfterFilter = afterInstant != null;
        List<Company> list = companyRepository.search(
                name != null && !name.trim().isEmpty() ? name.trim() : null,
                email != null && !email.trim().isEmpty() ? email.trim() : null,
                industry != null && !industry.trim().isEmpty() ? industry.trim() : null,
                hasAfterFilter,
                afterInstant);
        return list.stream().map(mapper::toCompanyDto).collect(Collectors.toList());
    }

    public byte[] exportCompanyReportExcel(String name, String email, String industry, String after, UserPrincipal principal) {
        List<CompanyDto> rows = getCompanyReport(name, email, industry, after, principal);
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Companies");
            CellStyle headerStyle = wb.createCellStyle();
            Font f = wb.createFont();
            f.setBold(true);
            headerStyle.setFont(f);
            String[] headers = { "Company Name", "Email", "Phone", "Industry", "Size", "Headquarters", "Type", "Specialities", "Created At" };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;
            for (CompanyDto d : rows) {
                Row r = sheet.createRow(rowNum++);
                r.createCell(0).setCellValue(d.getCompanyName());
                r.createCell(1).setCellValue(d.getEmail());
                r.createCell(2).setCellValue(d.getCompanyPhone() != null ? d.getCompanyPhone() : "");
                r.createCell(3).setCellValue(d.getIndustry() != null ? d.getIndustry() : "");
                r.createCell(4).setCellValue(d.getCompanySize() != null ? d.getCompanySize() : "");
                r.createCell(5).setCellValue(d.getHeadquarters() != null ? d.getHeadquarters() : "");
                r.createCell(6).setCellValue(d.getCompanyType() != null ? d.getCompanyType() : "");
                r.createCell(7).setCellValue(d.getSpecialities() != null ? d.getSpecialities() : "");
                r.createCell(8).setCellValue(d.getCreatedAt() != null ? d.getCreatedAt().atZone(ZoneId.of("UTC")).format(fmt) : "");
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Export failed", e);
        }
    }

    public byte[] exportCandidateReportExcel(String search, UserPrincipal principal) {
        List<CandidateDto> rows = getCandidateReport(search, principal);
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Candidates");
            CellStyle headerStyle = wb.createCellStyle();
            Font f = wb.createFont();
            f.setBold(true);
            headerStyle.setFont(f);
            String[] headers = { "Name", "Email", "Mobile", "Gender", "Education", "Work Experience", "Skills", "Created At" };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;
            for (CandidateDto d : rows) {
                Row r = sheet.createRow(rowNum++);
                r.createCell(0).setCellValue(d.getName());
                r.createCell(1).setCellValue(d.getEmail());
                r.createCell(2).setCellValue(d.getMobile() != null ? d.getMobile() : "");
                r.createCell(3).setCellValue(d.getGender() != null ? d.getGender().toString() : "");
                r.createCell(4).setCellValue(d.getEducation() != null ? d.getEducation() : "");
                r.createCell(5).setCellValue(d.getWorkExperience() != null ? d.getWorkExperience() : "");
                r.createCell(6).setCellValue(d.getSkills() != null ? d.getSkills() : "");
                r.createCell(7).setCellValue(d.getCreatedAt() != null ? d.getCreatedAt().atZone(ZoneId.of("UTC")).format(fmt) : "");
            }
            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Export failed", e);
        }
    }
}
