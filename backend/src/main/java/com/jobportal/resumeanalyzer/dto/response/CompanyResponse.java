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
public class CompanyResponse {
    private Long id;
    private String name;
    private String description;
    private String website;
    private String location;
    private String logoUrl;
    private String industry;
    private Integer foundedYear;
    private int jobCount;
    private LocalDateTime createdAt;
}
