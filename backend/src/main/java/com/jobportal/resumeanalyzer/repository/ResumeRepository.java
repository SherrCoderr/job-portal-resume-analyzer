package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.Resume;
import com.jobportal.resumeanalyzer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByUploadedAtDesc(User user);
    List<Resume> findByUserIdOrderByUploadedAtDesc(Long userId);
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);
}
