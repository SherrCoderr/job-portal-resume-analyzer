package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.request.LoginRequest;
import com.jobportal.resumeanalyzer.dto.request.RegisterRequest;
import com.jobportal.resumeanalyzer.dto.response.AuthResponse;
import com.jobportal.resumeanalyzer.dto.response.UserResponse;
import com.jobportal.resumeanalyzer.entity.*;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.repository.CompanyRepository;
import com.jobportal.resumeanalyzer.repository.JobSeekerProfileRepository;
import com.jobportal.resumeanalyzer.repository.RecruiterProfileRepository;
import com.jobportal.resumeanalyzer.repository.UserRepository;
import com.jobportal.resumeanalyzer.security.JwtUtils;
import com.jobportal.resumeanalyzer.security.UserDetailsImpl;
import com.jobportal.resumeanalyzer.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("An account already exists with email: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        Long companyId = null;
        String companyName = null;

        if (request.getRole() == RoleEnum.ROLE_JOB_SEEKER) {
            JobSeekerProfile profile = JobSeekerProfile.builder()
                    .user(savedUser)
                    .headline("Job Seeker")
                    .build();
            jobSeekerProfileRepository.save(profile);
        } else if (request.getRole() == RoleEnum.ROLE_RECRUITER) {
            Company company = null;
            if (StringUtils.hasText(request.getCompanyName())) {
                String cName = request.getCompanyName().trim();
                company = companyRepository.findByNameIgnoreCase(cName)
                        .orElseGet(() -> companyRepository.save(Company.builder()
                                .name(cName)
                                .location(savedUser.getPhone())
                                .description("Company profile for " + cName)
                                .build()));
                companyId = company.getId();
                companyName = company.getName();
            }

            RecruiterProfile profile = RecruiterProfile.builder()
                    .user(savedUser)
                    .company(company)
                    .designation(StringUtils.hasText(request.getDesignation()) ? request.getDesignation().trim() : "Hiring Manager")
                    .build();
            recruiterProfileRepository.save(profile);
        }

        String token = jwtUtils.generateTokenFromEmail(savedUser.getEmail());

        log.info("Successfully registered new user: {} with role: {}", savedUser.getEmail(), savedUser.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .companyId(companyId)
                .companyName(companyName)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userPrincipal.getUsername()));

        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled. Please contact administrator.");
        }

        String token = jwtUtils.generateJwtToken(authentication);

        Long companyId = null;
        String companyName = null;

        if (user.getRole() == RoleEnum.ROLE_RECRUITER) {
            var recruiterProfile = recruiterProfileRepository.findByUser(user);
            if (recruiterProfile.isPresent() && recruiterProfile.get().getCompany() != null) {
                companyId = recruiterProfile.get().getCompany().getId();
                companyName = recruiterProfile.get().getCompany().getName();
            }
        }

        log.info("User successfully authenticated: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .companyId(companyId)
                .companyName(companyName)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

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
