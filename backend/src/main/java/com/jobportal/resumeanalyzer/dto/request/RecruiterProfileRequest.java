package com.jobportal.resumeanalyzer.dto.request;

import lombok.Data;

@Data
public class RecruiterProfileRequest {
    private Long companyId;
    private String designation;
    private String department;
}
