package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.request.JobSeekerProfileRequest;
import com.jobportal.resumeanalyzer.dto.request.RecruiterProfileRequest;
import com.jobportal.resumeanalyzer.dto.response.CompanyResponse;
import com.jobportal.resumeanalyzer.dto.response.JobSeekerProfileResponse;
import com.jobportal.resumeanalyzer.dto.response.RecruiterProfileResponse;
import com.jobportal.resumeanalyzer.dto.response.ResumeResponse;
import com.jobportal.resumeanalyzer.entity.Company;
import com.jobportal.resumeanalyzer.entity.JobSeekerProfile;
import com.jobportal.resumeanalyzer.entity.RecruiterProfile;
import com.jobportal.resumeanalyzer.entity.Resume;
import com.jobportal.resumeanalyzer.entity.User;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.repository.CompanyRepository;
import com.jobportal.resumeanalyzer.repository.JobSeekerProfileRepository;
import com.jobportal.resumeanalyzer.repository.RecruiterProfileRepository;
import com.jobportal.resumeanalyzer.repository.ResumeRepository;
import com.jobportal.resumeanalyzer.repository.UserRepository;
import com.jobportal.resumeanalyzer.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final ResumeRepository resumeRepository;

    @Override
    @Transactional(readOnly = true)
    public JobSeekerProfileResponse getJobSeekerProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        JobSeekerProfile profile = jobSeekerProfileRepository.findByUser(user)
                .orElseGet(() -> jobSeekerProfileRepository.save(JobSeekerProfile.builder().user(user).build()));

        return mapToJobSeekerResponse(profile);
    }

    @Override
    @Transactional
    public JobSeekerProfileResponse updateJobSeekerProfile(String userEmail, JobSeekerProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        JobSeekerProfile profile = jobSeekerProfileRepository.findByUser(user)
                .orElseGet(() -> JobSeekerProfile.builder().user(user).build());

        profile.setHeadline(request.getHeadline());
        profile.setBio(request.getBio());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setEducation(request.getEducation());
        profile.setLocation(request.getLocation());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());

        if (request.getSkills() != null) {
            profile.setSkills(new ArrayList<>(request.getSkills()));
        }

        if (request.getActiveResumeId() != null) {
            Resume resume = resumeRepository.findById(request.getActiveResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + request.getActiveResumeId()));
            if (resume.getUser().getId().equals(user.getId())) {
                profile.setActiveResume(resume);
            }
        }

        JobSeekerProfile saved = jobSeekerProfileRepository.save(profile);
        return mapToJobSeekerResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JobSeekerProfileResponse getJobSeekerProfileByUserId(Long userId) {
        JobSeekerProfile profile = jobSeekerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker profile not found for user id: " + userId));

        return mapToJobSeekerResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterProfileResponse getRecruiterProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        RecruiterProfile profile = recruiterProfileRepository.findByUser(user)
                .orElseGet(() -> recruiterProfileRepository.save(RecruiterProfile.builder().user(user).build()));

        return mapToRecruiterResponse(profile);
    }

    @Override
    @Transactional
    public RecruiterProfileResponse updateRecruiterProfile(String userEmail, RecruiterProfileRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        RecruiterProfile profile = recruiterProfileRepository.findByUser(user)
                .orElseGet(() -> RecruiterProfile.builder().user(user).build());

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));
            profile.setCompany(company);
        }

        profile.setDesignation(request.getDesignation());
        profile.setDepartment(request.getDepartment());

        RecruiterProfile saved = recruiterProfileRepository.save(profile);
        return mapToRecruiterResponse(saved);
    }

    private JobSeekerProfileResponse mapToJobSeekerResponse(JobSeekerProfile profile) {
        User user = profile.getUser();
        Resume activeResume = profile.getActiveResume();

        ResumeResponse resumeResponse = null;
        if (activeResume != null) {
            resumeResponse = ResumeResponse.builder()
                    .id(activeResume.getId())
                    .userId(user.getId())
                    .originalFileName(activeResume.getOriginalFileName())
                    .fileType(activeResume.getFileType())
                    .fileSize(activeResume.getFileSize())
                    .parsedSkills(activeResume.getParsedSkills())
                    .uploadedAt(activeResume.getUploadedAt())
                    .build();
        }

        return JobSeekerProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .experienceYears(profile.getExperienceYears())
                .education(profile.getEducation())
                .location(profile.getLocation())
                .portfolioUrl(profile.getPortfolioUrl())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .skills(profile.getSkills() != null ? profile.getSkills() : new ArrayList<>())
                .activeResume(resumeResponse)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private RecruiterProfileResponse mapToRecruiterResponse(RecruiterProfile profile) {
        User user = profile.getUser();
        Company company = profile.getCompany();

        CompanyResponse companyResponse = null;
        if (company != null) {
            companyResponse = CompanyResponse.builder()
                    .id(company.getId())
                    .name(company.getName())
                    .description(company.getDescription())
                    .website(company.getWebsite())
                    .location(company.getLocation())
                    .logoUrl(company.getLogoUrl())
                    .industry(company.getIndustry())
                    .foundedYear(company.getFoundedYear())
                    .build();
        }

        return RecruiterProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .company(companyResponse)
                .designation(profile.getDesignation())
                .department(profile.getDepartment())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
