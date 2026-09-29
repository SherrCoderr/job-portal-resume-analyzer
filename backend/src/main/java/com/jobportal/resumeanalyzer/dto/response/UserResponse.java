package com.jobportal.resumeanalyzer.dto.response;

import com.jobportal.resumeanalyzer.entity.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private RoleEnum role;
    private boolean enabled;
    private LocalDateTime createdAt;
}
