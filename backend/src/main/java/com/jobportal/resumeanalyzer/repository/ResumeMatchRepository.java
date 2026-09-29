package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.ResumeMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeMatchRepository extends JpaRepository<ResumeMatch, Long> {
    Optional<ResumeMatch> findByResumeIdAndJobId(Long resumeId, Long jobId);
}
