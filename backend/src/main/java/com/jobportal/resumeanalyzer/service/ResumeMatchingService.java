package com.jobportal.resumeanalyzer.service;

import com.jobportal.resumeanalyzer.dto.response.ResumeMatchResponse;
import com.jobportal.resumeanalyzer.entity.Job;
import com.jobportal.resumeanalyzer.entity.Resume;
import com.jobportal.resumeanalyzer.entity.ResumeMatch;

import java.util.List;

public interface ResumeMatchingService {
    ResumeMatch matchResumeAndJob(Resume resume, Job job);
    ResumeMatchResponse calculateMatchResponse(Long resumeId, Long jobId);
    ResumeMatchResponse compareSkillLists(List<String> resumeSkills, List<String> requiredSkills);
}
