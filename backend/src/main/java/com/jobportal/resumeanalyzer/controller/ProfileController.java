package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.request.JobSeekerProfileRequest;
import com.jobportal.resumeanalyzer.dto.request.RecruiterProfileRequest;
import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.JobSeekerProfileResponse;
import com.jobportal.resumeanalyzer.dto.response.RecruiterProfileResponse;
import com.jobportal.resumeanalyzer.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/seeker")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobSeekerProfileResponse>> getSeekerProfile(Authentication authentication) {
        JobSeekerProfileResponse profile = profileService.getJobSeekerProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/seeker")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobSeekerProfileResponse>> updateSeekerProfile(
            Authentication authentication,
            @Valid @RequestBody JobSeekerProfileRequest request
    ) {
        JobSeekerProfileResponse updated = profileService.updateJobSeekerProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/seeker/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<JobSeekerProfileResponse>> getSeekerProfileById(@PathVariable Long userId) {
        JobSeekerProfileResponse profile = profileService.getJobSeekerProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> getRecruiterProfile(Authentication authentication) {
        RecruiterProfileResponse profile = profileService.getRecruiterProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/recruiter")
    @PreAuthorize("hasAnyAuthority('ROLE_RECRUITER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> updateRecruiterProfile(
            Authentication authentication,
            @Valid @RequestBody RecruiterProfileRequest request
    ) {
        RecruiterProfileResponse updated = profileService.updateRecruiterProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Recruiter profile updated successfully", updated));
    }
}
