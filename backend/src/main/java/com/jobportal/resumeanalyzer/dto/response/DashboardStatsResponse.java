package com.jobportal.resumeanalyzer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalJobSeekers;
    private long totalRecruiters;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long shortlistedCount;
    private long hiredCount;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> jobsByType;
}
