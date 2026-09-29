package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.response.DashboardStatsResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.dto.response.UserResponse;
import com.jobportal.resumeanalyzer.entity.RoleEnum;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    PagedResponse<UserResponse> getAllUsers(RoleEnum role, int page, int size);
    UserResponse toggleUserStatus(Long userId, String adminEmail);
    void deleteUser(Long userId, String adminEmail);
    void deleteJob(Long jobId, String adminEmail);
}
