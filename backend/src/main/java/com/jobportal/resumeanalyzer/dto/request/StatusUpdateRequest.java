package com.jobportal.resumeanalyzer.dto.request;

import com.jobportal.resumeanalyzer.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull(message = "Application status is required")
    private ApplicationStatus status;
}
