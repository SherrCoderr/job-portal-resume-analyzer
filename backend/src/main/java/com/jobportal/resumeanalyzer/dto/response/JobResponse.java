package com.jobportal.resumeanalyzer.dto.response;

import com.jobportal.resumeanalyzer.entity.ExperienceLevel;
import com.jobportal.resumeanalyzer.entity.JobType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyLocation;
    private Long recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String location;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private Integer minExperienceYears;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String salaryCurrency;
    private List<String> requiredSkills;
    private List<String> niceToHaveSkills;
    private String status;
    private long applicantCount;
    private boolean hasApplied; // For the currently authenticated job seeker
    private Double seekerMatchScore; // Instant match score if seeker has an active resume
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
