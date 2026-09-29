package com.jobportal.resumeanalyzer.dto.request;

import com.jobportal.resumeanalyzer.entity.RoleEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    private String phone;

    @NotNull(message = "Role is required (ROLE_JOB_SEEKER, ROLE_RECRUITER, ROLE_ADMIN)")
    private RoleEnum role;

    // Optional fields for recruiter initial company association
    private String companyName;
    private String designation;
}
