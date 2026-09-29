package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.request.JobSeekerProfileRequest;
import com.jobportal.resumeanalyzer.dto.request.RecruiterProfileRequest;
import com.jobportal.resumeanalyzer.dto.response.JobSeekerProfileResponse;
import com.jobportal.resumeanalyzer.dto.response.RecruiterProfileResponse;

public interface ProfileService {
    JobSeekerProfileResponse getJobSeekerProfile(String userEmail);
    JobSeekerProfileResponse updateJobSeekerProfile(String userEmail, JobSeekerProfileRequest request);
    JobSeekerProfileResponse getJobSeekerProfileByUserId(Long userId);
    
    RecruiterProfileResponse getRecruiterProfile(String userEmail);
    RecruiterProfileResponse updateRecruiterProfile(String userEmail, RecruiterProfileRequest request);
}
