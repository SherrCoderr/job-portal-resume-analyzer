package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.response.ResumeResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {
    ResumeResponse uploadResume(MultipartFile file, String seekerEmail);
    ResumeResponse getResumeById(Long id, String userEmail);
    List<ResumeResponse> getMyResumes(String seekerEmail);
    void deleteResume(Long id, String seekerEmail);
    Resource downloadResume(Long id, String userEmail);
    String getOriginalFileName(Long id);
    List<String> getAllSupportedSkills();
}
