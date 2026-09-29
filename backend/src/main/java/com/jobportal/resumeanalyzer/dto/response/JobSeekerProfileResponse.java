package com.jobportal.resumeanalyzer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSeekerProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String headline;
    private String bio;
    private Integer experienceYears;
    private String education;
    private String location;
    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
    private List<String> skills;
    private ResumeResponse activeResume;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
