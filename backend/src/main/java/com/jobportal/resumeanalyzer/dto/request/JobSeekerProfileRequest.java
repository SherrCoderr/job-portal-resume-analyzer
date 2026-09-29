package com.jobportal.resumeanalyzer.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class JobSeekerProfileRequest {
    private String headline;
    private String bio;
    private Integer experienceYears;
    private String education;
    private String location;
    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
    private List<String> skills;
    private Long activeResumeId;
}
