package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.response.ResumeResponse;
import com.jobportal.resumeanalyzer.entity.*;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.exception.UnauthorizedException;
import com.jobportal.resumeanalyzer.repository.JobSeekerProfileRepository;
import com.jobportal.resumeanalyzer.repository.ResumeRepository;
import com.jobportal.resumeanalyzer.repository.UserRepository;
import com.jobportal.resumeanalyzer.service.FileStorageService;
import com.jobportal.resumeanalyzer.service.ResumeService;
import com.jobportal.resumeanalyzer.service.ResumeTextExtractorService;
import com.jobportal.resumeanalyzer.service.SkillParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final FileStorageService fileStorageService;
    private final ResumeTextExtractorService resumeTextExtractorService;
    private final SkillParserService skillParserService;

    @Override
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded resume file cannot be empty");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        log.info("Uploading resume for user {}: originalFilename={}, contentType={}", seeker.getEmail(), originalFilename, contentType);

        // Store file locally
        String storedFileName = fileStorageService.storeFile(file, "candidates");
        Path filePath = fileStorageService.getFilePath(storedFileName, "candidates");
        File diskFile = filePath.toFile();

        // Extract raw readable text
        String extractedText = "";
        try {
            extractedText = resumeTextExtractorService.extractText(diskFile, contentType);
        } catch (Exception e) {
            log.warn("Text extraction warning: {}", e.getMessage());
        }

        // Parse skills deterministically from extracted text
        List<String> parsedSkills = skillParserService.extractSkillsFromText(extractedText);

        Resume resume = Resume.builder()
                .user(seeker)
                .originalFileName(originalFilename != null ? originalFilename : "resume.pdf")
                .storedFileName(storedFileName)
                .fileType(contentType != null ? contentType : "application/pdf")
                .fileSize(file.getSize())
                .storagePath(filePath.toString())
                .extractedText(extractedText)
                .parsedSkills(parsedSkills)
                .build();

        Resume savedResume = resumeRepository.save(resume);

        // Update seeker profile with active resume and merged skills
        JobSeekerProfile profile = jobSeekerProfileRepository.findByUser(seeker)
                .orElseGet(() -> JobSeekerProfile.builder().user(seeker).build());

        profile.setActiveResume(savedResume);

        Set<String> currentSkills = new LinkedHashSet<>(profile.getSkills() != null ? profile.getSkills() : new ArrayList<>());
        currentSkills.addAll(parsedSkills);
        profile.setSkills(new ArrayList<>(currentSkills));

        jobSeekerProfileRepository.save(profile);
        log.info("Resume saved with ID: {} and extracted {} skills", savedResume.getId(), parsedSkills.size());

        return mapToResponse(savedResume);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(Long id, String userEmail) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean isOwner = resume.getUser().getId().equals(user.getId());
        boolean isRecruiterOrAdmin = user.getRole() == RoleEnum.ROLE_RECRUITER || user.getRole() == RoleEnum.ROLE_ADMIN;

        if (!isOwner && !isRecruiterOrAdmin) {
            throw new UnauthorizedException("You are not authorized to view this resume");
        }

        return mapToResponse(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        return resumeRepository.findByUserIdOrderByUploadedAtDesc(seeker.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteResume(Long id, String seekerEmail) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + seekerEmail));

        if (!resume.getUser().getId().equals(seeker.getId()) && seeker.getRole() != RoleEnum.ROLE_ADMIN) {
            throw new UnauthorizedException("You are not authorized to delete this resume");
        }

        fileStorageService.deleteFile(resume.getStoredFileName(), "candidates");
        resumeRepository.delete(resume);
        log.info("Resume ID {} deleted by {}", id, seekerEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadResume(Long id, String userEmail) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user != null) {
                boolean isOwner = resume.getUser().getId().equals(user.getId());
                boolean isRecruiterOrAdmin = user.getRole() == RoleEnum.ROLE_RECRUITER || user.getRole() == RoleEnum.ROLE_ADMIN;
                if (!isOwner && !isRecruiterOrAdmin) {
                    throw new UnauthorizedException("You are not authorized to download this resume");
                }
            }
        }

        return fileStorageService.loadFileAsResource(resume.getStoredFileName(), "candidates");
    }

    @Override
    @Transactional(readOnly = true)
    public String getOriginalFileName(Long id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", id));
        return resume.getOriginalFileName();
    }

    @Override
    public List<String> getAllSupportedSkills() {
        return skillParserService.getSupportedSkills();
    }

    private ResumeResponse mapToResponse(Resume resume) {
        String preview = "";
        if (resume.getExtractedText() != null) {
            preview = resume.getExtractedText().length() > 300
                    ? resume.getExtractedText().substring(0, 300) + "..."
                    : resume.getExtractedText();
        }

        return ResumeResponse.builder()
                .id(resume.getId())
                .userId(resume.getUser().getId())
                .originalFileName(resume.getOriginalFileName())
                .fileType(resume.getFileType())
                .fileSize(resume.getFileSize())
                .parsedSkills(resume.getParsedSkills() != null ? resume.getParsedSkills() : new ArrayList<>())
                .previewText(preview)
                .uploadedAt(resume.getUploadedAt())
                .build();
    }
}
