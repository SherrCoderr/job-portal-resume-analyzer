package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.request.JobRequest;
import com.jobportal.resumeanalyzer.dto.response.JobResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.entity.ExperienceLevel;
import com.jobportal.resumeanalyzer.entity.JobType;

public interface JobService {
    JobResponse createJob(JobRequest request, String recruiterEmail);
    JobResponse updateJob(Long id, JobRequest request, String recruiterEmail);
    void deleteJob(Long id, String userEmail);
    JobResponse getJobById(Long id, String currentUserEmail);
    PagedResponse<JobResponse> searchAndFilterJobs(
            String keyword,
            String location,
            JobType jobType,
            ExperienceLevel experienceLevel,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String currentUserEmail
    );
    PagedResponse<JobResponse> getRecruiterJobs(String recruiterEmail, int page, int size);
    JobResponse toggleJobStatus(Long id, String userEmail);
}
