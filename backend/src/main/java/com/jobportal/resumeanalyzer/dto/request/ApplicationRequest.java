package com.jobportal.resumeanalyzer.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    private Long resumeId; // If null, the active/latest resume of the seeker is used

    private String coverLetter;
}
