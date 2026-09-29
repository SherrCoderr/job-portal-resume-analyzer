package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.request.ApplicationRequest;
import com.jobportal.resumeanalyzer.dto.request.StatusUpdateRequest;
import com.jobportal.resumeanalyzer.dto.response.ApplicationResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;

public interface ApplicationService {
    ApplicationResponse applyToJob(ApplicationRequest request, String seekerEmail);
    PagedResponse<ApplicationResponse> getSeekerApplications(String seekerEmail, int page, int size);
    PagedResponse<ApplicationResponse> getJobApplicants(Long jobId, String recruiterEmail, int page, int size);
    PagedResponse<ApplicationResponse> getRecruiterApplications(String recruiterEmail, int page, int size);
    ApplicationResponse updateApplicationStatus(Long applicationId, StatusUpdateRequest request, String recruiterEmail);
    ApplicationResponse getApplicationById(Long applicationId, String userEmail);
}
