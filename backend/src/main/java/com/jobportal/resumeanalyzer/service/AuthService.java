package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.request.LoginRequest;
import com.jobportal.resumeanalyzer.dto.request.RegisterRequest;
import com.jobportal.resumeanalyzer.dto.response.AuthResponse;
import com.jobportal.resumeanalyzer.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String email);
}
