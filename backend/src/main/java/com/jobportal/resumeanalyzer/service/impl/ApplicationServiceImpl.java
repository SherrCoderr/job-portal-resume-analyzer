package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.request.ApplicationRequest;
import com.jobportal.resumeanalyzer.dto.request.StatusUpdateRequest;
import com.jobportal.resumeanalyzer.dto.response.ApplicationResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.dto.response.ResumeMatchResponse;
import com.jobportal.resumeanalyzer.entity.*;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.DuplicateApplicationException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.exception.UnauthorizedException;
import com.jobportal.resumeanalyzer.repository.*;
import com.jobportal.resumeanalyzer.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final ResumeMatchRepository resumeMatchRepository;

    @Override
    @Transactional
    public ApplicationResponse applyToJob(ApplicationRequest request, String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", request.getJobId()));

        if (!"ACTIVE".equalsIgnoreCase(job.getStatus())) {
            throw new BadRequestException("Cannot apply to a job that is closed or inactive");
        }

        // Prevent duplicate applications
        if (applicationRepository.existsByJobIdAndJobSeekerId(job.getId(), seeker.getId())) {
            throw new DuplicateApplicationException("You have already applied for this job: " + job.getTitle());
        }

        // Resolve resume
        Resume resume = null;
        if (request.getResumeId() != null) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", request.getResumeId()));
            if (!resume.getUser().getId().equals(seeker.getId())) {
                throw new UnauthorizedException("You can only submit your own resume");
            }
        } else {
            // Check active resume from profile or latest uploaded
            JobSeekerProfile profile = jobSeekerProfileRepository.findByUser(seeker).orElse(null);
            if (profile != null && profile.getActiveResume() != null) {
                resume = profile.getActiveResume();
            } else {
                resume = resumeRepository.findTopByUserIdOrderByUploadedAtDesc(seeker.getId())
                        .orElseThrow(() -> new BadRequestException("Please upload a resume before applying to jobs"));
            }
        }

        // Calculate deterministic resume match
        ResumeMatch resumeMatch = calculateMatch(resume, job);

        Application application = Application.builder()
                .job(job)
                .jobSeeker(seeker)
                .resume(resume)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(request.getCoverLetter())
                .resumeMatch(resumeMatch)
                .build();

        Application saved = applicationRepository.save(application);
        log.info("Job application submitted by user {} for job ID {}", seeker.getEmail(), job.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getSeekerApplications(String seekerEmail, int page, int size) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> applicationPage = applicationRepository.findByJobSeekerId(seeker.getId(), pageable);

        List<ApplicationResponse> list = applicationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationResponse>builder()
                .content(list)
                .pageNumber(applicationPage.getNumber())
                .pageSize(applicationPage.getSize())
                .totalElements(applicationPage.getTotalElements())
                .totalPages(applicationPage.getTotalPages())
                .isLast(applicationPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getJobApplicants(Long jobId, String recruiterEmail, int page, int size) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        boolean isOwner = job.getRecruiter().getId().equals(recruiter.getId());
        if (recruiter.getRole() != RoleEnum.ROLE_ADMIN && !isOwner) {
            throw new UnauthorizedException("You are not authorized to view applicants for this job");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> applicationPage = applicationRepository.findByJobId(jobId, pageable);

        List<ApplicationResponse> list = applicationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationResponse>builder()
                .content(list)
                .pageNumber(applicationPage.getNumber())
                .pageSize(applicationPage.getSize())
                .totalElements(applicationPage.getTotalElements())
                .totalPages(applicationPage.getTotalPages())
                .isLast(applicationPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> getRecruiterApplications(String recruiterEmail, int page, int size) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> applicationPage;

        if (recruiter.getRole() == RoleEnum.ROLE_ADMIN) {
            applicationPage = applicationRepository.findAll(pageable);
        } else {
            applicationPage = applicationRepository.findByRecruiterId(recruiter.getId(), pageable);
        }

        List<ApplicationResponse> list = applicationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ApplicationResponse>builder()
                .content(list)
                .pageNumber(applicationPage.getNumber())
                .pageSize(applicationPage.getSize())
                .totalElements(applicationPage.getTotalElements())
                .totalPages(applicationPage.getTotalPages())
                .isLast(applicationPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, StatusUpdateRequest request, String recruiterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        boolean isOwner = application.getJob().getRecruiter().getId().equals(user.getId());
        if (user.getRole() != RoleEnum.ROLE_ADMIN && !isOwner) {
            throw new UnauthorizedException("You are not authorized to update this application's status");
        }

        application.setStatus(request.getStatus());
        Application updated = applicationRepository.save(application);
        log.info("Application id {} status updated to {}", applicationId, request.getStatus());

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long applicationId, String userEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", applicationId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean isSeeker = application.getJobSeeker().getId().equals(user.getId());
        boolean isRecruiter = application.getJob().getRecruiter().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == RoleEnum.ROLE_ADMIN;

        if (!isSeeker && !isRecruiter && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to view this application");
        }

        return mapToResponse(application);
    }

    private ResumeMatch calculateMatch(Resume resume, Job job) {
        List<String> requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>();
        List<String> resumeSkills = resume.getParsedSkills() != null ? resume.getParsedSkills() : new ArrayList<>();

        Set<String> normalizedResumeSkills = resumeSkills.stream()
                .map(s -> s.toLowerCase().trim())
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            String cleanReq = req.trim();
            if (normalizedResumeSkills.contains(cleanReq.toLowerCase())) {
                matched.add(cleanReq);
            } else {
                missing.add(cleanReq);
            }
        }

        double score = 0.0;
        if (!requiredSkills.isEmpty()) {
            double calculated = ((double) matched.size() / requiredSkills.size()) * 100.0;
            score = Math.round(calculated * 10.0) / 10.0;
        }

        return ResumeMatch.builder()
                .resume(resume)
                .job(job)
                .matchScore(score)
                .totalRequiredSkillsCount(requiredSkills.size())
                .matchedSkillsCount(matched.size())
                .missingSkillsCount(missing.size())
                .matchedSkills(matched)
                .missingSkills(missing)
                .build();
    }

    private ApplicationResponse mapToResponse(Application app) {
        ResumeMatch match = app.getResumeMatch();
        ResumeMatchResponse matchResponse = null;

        if (match != null) {
            matchResponse = ResumeMatchResponse.builder()
                    .id(match.getId())
                    .resumeId(match.getResume() != null ? match.getResume().getId() : null)
                    .jobId(match.getJob() != null ? match.getJob().getId() : null)
                    .matchScore(match.getMatchScore())
                    .totalRequiredSkillsCount(match.getTotalRequiredSkillsCount())
                    .matchedSkillsCount(match.getMatchedSkillsCount())
                    .missingSkillsCount(match.getMissingSkillsCount())
                    .matchedSkills(match.getMatchedSkills() != null ? match.getMatchedSkills() : new ArrayList<>())
                    .missingSkills(match.getMissingSkills() != null ? match.getMissingSkills() : new ArrayList<>())
                    .calculatedAt(match.getCalculatedAt())
                    .build();
        }

        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyName(app.getJob().getCompany().getName())
                .jobLocation(app.getJob().getLocation())
                .jobSeekerId(app.getJobSeeker().getId())
                .jobSeekerName(app.getJobSeeker().getFullName())
                .jobSeekerEmail(app.getJobSeeker().getEmail())
                .jobSeekerPhone(app.getJobSeeker().getPhone())
                .resumeId(app.getResume().getId())
                .resumeFileName(app.getResume().getOriginalFileName())
                .status(app.getStatus())
                .coverLetter(app.getCoverLetter())
                .resumeMatch(matchResponse)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
