package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.request.CompanyRequest;
import com.jobportal.resumeanalyzer.dto.response.CompanyResponse;
import com.jobportal.resumeanalyzer.entity.Company;
import com.jobportal.resumeanalyzer.entity.RoleEnum;
import com.jobportal.resumeanalyzer.entity.User;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.exception.UnauthorizedException;
import com.jobportal.resumeanalyzer.repository.CompanyRepository;
import com.jobportal.resumeanalyzer.repository.UserRepository;
import com.jobportal.resumeanalyzer.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CompanyResponse createCompany(CompanyRequest request) {
        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Company with name '" + request.getName() + "' already exists");
        }

        Company company = Company.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .website(request.getWebsite())
                .location(request.getLocation())
                .logoUrl(request.getLogoUrl())
                .industry(request.getIndustry())
                .foundedYear(request.getFoundedYear())
                .build();

        Company saved = companyRepository.save(company);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(Long id, CompanyRequest request, String userEmail) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Allow update if admin or recruiter associated with this company
        boolean isRecruiterOfCompany = user.getRecruiterProfile() != null &&
                user.getRecruiterProfile().getCompany() != null &&
                user.getRecruiterProfile().getCompany().getId().equals(id);

        if (user.getRole() != RoleEnum.ROLE_ADMIN && !isRecruiterOfCompany) {
            throw new UnauthorizedException("You are not authorized to update this company's profile");
        }

        company.setName(request.getName().trim());
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setLocation(request.getLocation());
        company.setLogoUrl(request.getLogoUrl());
        company.setIndustry(request.getIndustry());
        company.setFoundedYear(request.getFoundedYear());

        Company updated = companyRepository.save(company);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return mapToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCompany(Long id, String userEmail) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (user.getRole() != RoleEnum.ROLE_ADMIN) {
            throw new UnauthorizedException("Only administrators can delete companies");
        }

        companyRepository.delete(company);
    }

    private CompanyResponse mapToResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .location(company.getLocation())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .foundedYear(company.getFoundedYear())
                .jobCount(company.getJobs() != null ? company.getJobs().size() : 0)
                .createdAt(company.getCreatedAt())
                .build();
    }
}
