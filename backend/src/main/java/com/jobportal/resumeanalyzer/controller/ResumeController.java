package com.jobportal.resumeanalyzer.controller;

import com.jobportal.resumeanalyzer.dto.response.ApiResponse;
import com.jobportal.resumeanalyzer.dto.response.ResumeMatchResponse;
import com.jobportal.resumeanalyzer.dto.response.ResumeResponse;
import com.jobportal.resumeanalyzer.service.ResumeMatchingService;
import com.jobportal.resumeanalyzer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeMatchingService resumeMatchingService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        ResumeResponse response = resumeService.uploadResume(file, authentication.getName());
        return new ResponseEntity<>(ApiResponse.ok("Resume uploaded and parsed successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my-resumes")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes(Authentication authentication) {
        List<ResumeResponse> resumes = resumeService.getMyResumes(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(resumes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ResumeResponse resume = resumeService.getResumeById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(resume));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_JOB_SEEKER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long id,
            Authentication authentication
    ) {
        resumeService.deleteResume(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Resume deleted successfully", null));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        Resource resource = resumeService.downloadResume(id, email);
        String originalFilename = resumeService.getOriginalFileName(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFilename + "\"")
                .body(resource);
    }

    @PostMapping("/match")
    public ResponseEntity<ApiResponse<ResumeMatchResponse>> matchResumeWithJob(
            @RequestBody Map<String, Long> payload
    ) {
        Long resumeId = payload.get("resumeId");
        Long jobId = payload.get("jobId");

        if (resumeId == null || jobId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Both resumeId and jobId are required"));
        }

        ResumeMatchResponse response = resumeMatchingService.calculateMatchResponse(resumeId, jobId);
        return ResponseEntity.ok(ApiResponse.ok("Resume match calculated successfully", response));
    }

    @GetMapping("/skills/supported")
    public ResponseEntity<ApiResponse<List<String>>> getSupportedSkills() {
        return ResponseEntity.ok(ApiResponse.ok(resumeService.getAllSupportedSkills()));
    }
}
