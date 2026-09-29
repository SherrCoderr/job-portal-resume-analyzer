package com.jobportal.resumeanalyzer.dto.request;

import com.jobportal.resumeanalyzer.entity.ExperienceLevel;
import com.jobportal.resumeanalyzer.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class JobRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private Long companyId;
    private String companyName; // For convenience if company doesn't exist yet

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    private Integer minExperienceYears;

    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String salaryCurrency;

    @NotEmpty(message = "At least one required skill must be specified")
    private List<String> requiredSkills;

    private List<String> niceToHaveSkills;

    private String status; // ACTIVE, CLOSED
}
