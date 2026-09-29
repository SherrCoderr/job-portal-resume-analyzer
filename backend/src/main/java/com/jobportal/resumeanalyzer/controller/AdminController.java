package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.DashboardStatsResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.dto.response.UserResponse;
import com.jobportal.resumeanalyzer.entity.RoleEnum;
import com.jobportal.resumeanalyzer.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(required = false) RoleEnum role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PagedResponse<UserResponse> users = adminService.getAllUsers(role, page, size);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        UserResponse updated = adminService.toggleUserStatus(userId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", updated));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        adminService.deleteUser(userId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long jobId,
            Authentication authentication
    ) {
        adminService.deleteJob(jobId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Job posting removed successfully", null));
    }
}
