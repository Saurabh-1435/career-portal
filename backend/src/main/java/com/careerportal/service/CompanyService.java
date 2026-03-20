package com.careerportal.service;

import com.careerportal.dto.CompanyDto;
import com.careerportal.dto.CompanyUpdateRequest;
import com.careerportal.entity.Company;
import com.careerportal.repository.CompanyRepository;
import com.careerportal.security.UserPrincipal;
import com.careerportal.util.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final DtoMapper mapper;

    public CompanyDto getById(Long id, UserPrincipal principal) {
        Company c = companyRepository.findByIdWithUser(id).orElseThrow();
        ensureCanAccessCompany(c, principal);
        return mapper.toCompanyDto(c);
    }

    public CompanyDto getByUserId(Long userId, UserPrincipal principal) {
        Company c = companyRepository.findByUserIdWithUser(userId).orElseThrow();
        ensureCanAccessCompany(c, principal);
        return mapper.toCompanyDto(c);
    }

    public List<CompanyDto> listAll(UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            // Admins can see all companies regardless of status
            return companyRepository.findAllWithUser().stream()
                    .map(mapper::toCompanyDto)
                    .collect(Collectors.toList());
        } else {
            // Non-admins can only see approved companies
            return companyRepository.findAllWithUser().stream()
                    .filter(c -> c.getStatus() == com.careerportal.entity.Company.Status.APPROVED)
                    .map(mapper::toCompanyDto)
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public CompanyDto update(Long companyId, CompanyUpdateRequest req, UserPrincipal principal) {
        Company c = companyRepository.findByIdWithUser(companyId).orElseThrow();
        ensureCanEditCompany(c, principal);
        if (req.getCompanyName() != null) c.setCompanyName(req.getCompanyName());
        if (req.getIndustry() != null) c.setIndustry(req.getIndustry());
        if (req.getCompanySize() != null) c.setCompanySize(req.getCompanySize());
        if (req.getHeadquarters() != null) c.setHeadquarters(req.getHeadquarters());
        if (req.getCompanyType() != null) c.setCompanyType(req.getCompanyType());
        if (req.getFounded() != null) c.setFounded(req.getFounded());
        if (req.getSpecialities() != null) c.setSpecialities(req.getSpecialities());
        if (req.getAddress() != null) c.setAddress(req.getAddress());
        if (req.getCompanyPhone() != null) c.setCompanyPhone(req.getCompanyPhone());
        c = companyRepository.save(c);
        return mapper.toCompanyDto(c);
    }

    private void ensureCanAccessCompany(Company c, UserPrincipal principal) {
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"))
                && principal.getProfileId() != null && principal.getProfileId().equals(c.getId()))
            return;
        throw new AccessDeniedException("Not authorized to access this company. Company ID: " + c.getId() + ", Principal ID: " + principal.getProfileId());
    }

    private void ensureCanEditCompany(Company c, UserPrincipal principal) {
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            return;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"))
                && principal.getProfileId() != null && principal.getProfileId().equals(c.getId()))
            return;
        throw new AccessDeniedException("Not authorized to edit this company");
    }
}
