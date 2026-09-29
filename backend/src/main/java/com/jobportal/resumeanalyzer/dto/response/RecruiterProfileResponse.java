package com.jobportal.resumeanalyzer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private CompanyResponse company;
    private String designation;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
