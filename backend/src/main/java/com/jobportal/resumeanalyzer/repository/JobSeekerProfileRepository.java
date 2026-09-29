package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.JobSeekerProfile;
import com.jobportal.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobSeekerProfileRepository extends JpaRepository<JobSeekerProfile, Long> {
    Optional<JobSeekerProfile> findByUser(User user);
    Optional<JobSeekerProfile> findByUserId(Long userId);
}
