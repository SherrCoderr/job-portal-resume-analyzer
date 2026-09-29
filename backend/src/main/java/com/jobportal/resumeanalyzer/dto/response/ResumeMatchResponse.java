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
public class ResumeMatchResponse {
    private Long id;
    private Long resumeId;
    private Long jobId;
    private Double matchScore; // e.g. 75.0
    private Integer totalRequiredSkillsCount;
    private Integer matchedSkillsCount;
    private Integer missingSkillsCount;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private LocalDateTime calculatedAt;
}
