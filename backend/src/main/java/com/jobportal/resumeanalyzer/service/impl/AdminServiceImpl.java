package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.response.DashboardStatsResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.dto.response.UserResponse;
import com.jobportal.resumeanalyzer.entity.ApplicationStatus;
import com.jobportal.resumeanalyzer.entity.Job;
import com.jobportal.resumeanalyzer.entity.RoleEnum;
import com.jobportal.resumeanalyzer.entity.User;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.repository.ApplicationRepository;
import com.jobportal.resumeanalyzer.repository.JobRepository;
import com.jobportal.resumeanalyzer.repository.UserRepository;
import com.jobportal.resumeanalyzer.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalJobSeekers = userRepository.countByRole(RoleEnum.ROLE_JOB_SEEKER);
        long totalRecruiters = userRepository.countByRole(RoleEnum.ROLE_RECRUITER);
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus("ACTIVE");
        long totalApplications = applicationRepository.count();
        long shortlistedCount = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long hiredCount = applicationRepository.countByStatus(ApplicationStatus.HIRED);

        Map<String, Long> statusCounts = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status.name(), applicationRepository.countByStatus(status));
        }

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalJobSeekers(totalJobSeekers)
                .totalRecruiters(totalRecruiters)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalApplications(totalApplications)
                .shortlistedCount(shortlistedCount)
                .hiredCount(hiredCount)
                .applicationsByStatus(statusCounts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(RoleEnum role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = (role != null)
                ? userRepository.findAll((root, query, cb) -> cb.equal(root.get("role"), role), pageable)
                : userRepository.findAll(pageable);

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return PagedResponse.<UserResponse>builder()
                .content(userResponses)
                .pageNumber(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .isLast(userPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new BadRequestException("You cannot disable your own admin account");
        }

        user.setEnabled(!user.isEnabled());
        User updated = userRepository.save(user);
        log.info("Admin {} toggled status of user {} to enabled={}", adminEmail, user.getEmail(), user.isEnabled());

        return mapToUserResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new BadRequestException("You cannot delete your own admin account");
        }

        userRepository.delete(user);
        log.info("Admin {} deleted user {}", adminEmail, user.getEmail());
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, String adminEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        jobRepository.delete(job);
        log.info("Admin {} deleted job id {} ('{}')", adminEmail, jobId, job.getTitle());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
