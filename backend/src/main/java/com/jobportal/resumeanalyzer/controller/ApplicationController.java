package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.request.ApplicationRequest;
import com.jobportal.resumeanalyzer.dto.request.StatusUpdateRequest;
import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.ApplicationResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyToJob(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication
    ) {
        ApplicationResponse response = applicationService.applyToJob(request, authentication.getName());
        return new ResponseEntity<>(ApiResponse.ok("Application submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/seeker/my-applications")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PagedResponse<ApplicationResponse> response = applicationService.getSeekerApplications(
                authentication.getName(), page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getJobApplicants(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PagedResponse<ApplicationResponse> response = applicationService.getJobApplicants(
                jobId, authentication.getName(), page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/recruiter/all")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationResponse>>> getAllRecruiterApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PagedResponse<ApplicationResponse> response = applicationService.getRecruiterApplications(
                authentication.getName(), page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication
    ) {
        ApplicationResponse response = applicationService.updateApplicationStatus(
                id, request, authentication.getName()
        );
        return ResponseEntity.ok(ApiResponse.ok("Application status updated to " + request.getStatus(), response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ApplicationResponse response = applicationService.getApplicationById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
