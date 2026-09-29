package com.jobportal.resumeanalyzer.dto.response;

import com.jobportal.resumeanalyzer.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private String jobLocation;
    private Long jobSeekerId;
    private String jobSeekerName;
    private String jobSeekerEmail;
    private String jobSeekerPhone;
    private Long resumeId;
    private String resumeFileName;
    private ApplicationStatus status;
    private String coverLetter;
    private ResumeMatchResponse resumeMatch;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
