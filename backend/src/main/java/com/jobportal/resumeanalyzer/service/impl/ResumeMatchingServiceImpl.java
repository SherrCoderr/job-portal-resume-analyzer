package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.response.ResumeMatchResponse;
import com.jobportal.resumeanalyzer.entity.Job;
import com.jobportal.resumeanalyzer.entity.Resume;
import com.jobportal.resumeanalyzer.entity.ResumeMatch;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.repository.JobRepository;
import com.jobportal.resumeanalyzer.repository.ResumeMatchRepository;
import com.jobportal.resumeanalyzer.repository.ResumeRepository;
import com.jobportal.resumeanalyzer.service.ResumeMatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeMatchingServiceImpl implements ResumeMatchingService {

    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ResumeMatchRepository resumeMatchRepository;

    @Override
    @Transactional
    public ResumeMatch matchResumeAndJob(Resume resume, Job job) {
        List<String> requiredSkills = job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>();
        List<String> resumeSkills = resume.getParsedSkills() != null ? resume.getParsedSkills() : new ArrayList<>();

        ResumeMatchResponse comparison = compareSkillLists(resumeSkills, requiredSkills);

        ResumeMatch match = resumeMatchRepository.findByResumeIdAndJobId(resume.getId(), job.getId())
                .orElseGet(() -> ResumeMatch.builder()
                        .resume(resume)
                        .job(job)
                        .build());

        match.setMatchScore(comparison.getMatchScore());
        match.setTotalRequiredSkillsCount(comparison.getTotalRequiredSkillsCount());
        match.setMatchedSkillsCount(comparison.getMatchedSkillsCount());
        match.setMissingSkillsCount(comparison.getMissingSkillsCount());
        match.setMatchedSkills(comparison.getMatchedSkills());
        match.setMissingSkills(comparison.getMissingSkills());

        ResumeMatch saved = resumeMatchRepository.save(match);
        log.info("Calculated resume match: Resume ID {} vs Job ID {} = {}%", resume.getId(), job.getId(), saved.getMatchScore());

        return saved;
    }

    @Override
    @Transactional
    public ResumeMatchResponse calculateMatchResponse(Long resumeId, Long jobId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", jobId));

        ResumeMatch match = matchResumeAndJob(resume, job);

        return ResumeMatchResponse.builder()
                .id(match.getId())
                .resumeId(resume.getId())
                .jobId(job.getId())
                .matchScore(match.getMatchScore())
                .totalRequiredSkillsCount(match.getTotalRequiredSkillsCount())
                .matchedSkillsCount(match.getMatchedSkillsCount())
                .missingSkillsCount(match.getMissingSkillsCount())
                .matchedSkills(match.getMatchedSkills())
                .missingSkills(match.getMissingSkills())
                .calculatedAt(match.getCalculatedAt())
                .build();
    }

    @Override
    public ResumeMatchResponse compareSkillLists(List<String> resumeSkills, List<String> requiredSkills) {
        if (requiredSkills == null) requiredSkills = Collections.emptyList();
        if (resumeSkills == null) resumeSkills = Collections.emptyList();

        Set<String> normalizedResumeSkills = resumeSkills.stream()
                .map(s -> s.toLowerCase().trim())
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            String clean = req.trim();
            if (normalizedResumeSkills.contains(clean.toLowerCase())) {
                matched.add(clean);
            } else {
                missing.add(clean);
            }
        }

        double score = 0.0;
        if (!requiredSkills.isEmpty()) {
            double calculated = ((double) matched.size() / requiredSkills.size()) * 100.0;
            score = Math.round(calculated * 10.0) / 10.0;
        }

        return ResumeMatchResponse.builder()
                .matchScore(score)
                .totalRequiredSkillsCount(requiredSkills.size())
                .matchedSkillsCount(matched.size())
                .missingSkillsCount(missing.size())
                .matchedSkills(matched)
                .missingSkills(missing)
                .build();
    }
}
