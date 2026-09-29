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
public class ResumeResponse {
    private Long id;
    private Long userId;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private List<String> parsedSkills;
    private String previewText;
    private LocalDateTime uploadedAt;
}
