package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.request.CompanyRequest;
import com.jobportal.resumeanalyzer.dto.response.CompanyResponse;

import java.util.List;

public interface CompanyService {
    CompanyResponse createCompany(CompanyRequest request);
    CompanyResponse updateCompany(Long id, CompanyRequest request, String userEmail);
    CompanyResponse getCompanyById(Long id);
    List<CompanyResponse> getAllCompanies();
    void deleteCompany(Long id, String userEmail);
}
