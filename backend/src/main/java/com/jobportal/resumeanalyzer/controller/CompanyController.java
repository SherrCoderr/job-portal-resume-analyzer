package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.request.CompanyRequest;
import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.CompanyResponse;
import com.jobportal.resumeanalyzer.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAllCompanies() {
        return ResponseEntity.ok(ApiResponse.ok(companyService.getAllCompanies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(companyService.getCompanyById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest request) {
        CompanyResponse created = companyService.createCompany(request);
        return new ResponseEntity<>(ApiResponse.ok("Company created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request,
            Authentication authentication
    ) {
        CompanyResponse updated = companyService.updateCompany(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Company updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id, Authentication authentication) {
        companyService.deleteCompany(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Company deleted successfully", null));
    }
}
