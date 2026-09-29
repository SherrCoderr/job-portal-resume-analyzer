package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.request.JobRequest;
import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.JobResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.entity.ExperienceLevel;
import com.jobportal.resumeanalyzer.entity.JobType;
import com.jobportal.resumeanalyzer.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> searchAndFilterJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        PagedResponse<JobResponse> jobs = jobService.searchAndFilterJobs(
                keyword, location, jobType, experienceLevel, page, size, sortBy, sortDir, userEmail
        );
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobResponse>> getJobById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        JobResponse job = jobService.getJobById(id, userEmail);
        return ResponseEntity.ok(ApiResponse.ok(job));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> createJob(
            @Valid @RequestBody JobRequest request,
            Authentication authentication
    ) {
        JobResponse createdJob = jobService.createJob(request, authentication.getName());
        return new ResponseEntity<>(ApiResponse.ok("Job posted successfully", createdJob), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request,
            Authentication authentication
    ) {
        JobResponse updatedJob = jobService.updateJob(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Job updated successfully", updatedJob));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long id,
            Authentication authentication
    ) {
        jobService.deleteJob(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Job deleted successfully", null));
    }

    @GetMapping("/recruiter/my-jobs")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<JobResponse>>> getMyPostedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        PagedResponse<JobResponse> jobs = jobService.getRecruiterJobs(authentication.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.ok(jobs));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobResponse>> toggleJobStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        JobResponse updated = jobService.toggleJobStatus(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Job status updated", updated));
    }
}
