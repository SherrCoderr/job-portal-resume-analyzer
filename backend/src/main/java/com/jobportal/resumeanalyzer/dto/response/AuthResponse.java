package com.jobportal.resumeanalyzer.dto.response;

import com.jobportal.resumeanalyzer.entity.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private RoleEnum role;
    private Long companyId;
    private String companyName;
}
