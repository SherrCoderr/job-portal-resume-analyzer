package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.Application;
import com.jobportal.resumeanalyzer.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByJobIdAndJobSeekerId(Long jobId, Long jobSeekerId);

    Optional<Application> findByJobIdAndJobSeekerId(Long jobId, Long jobSeekerId);

    Page<Application> findByJobSeekerId(Long jobSeekerId, Pageable pageable);

    List<Application> findByJobSeekerId(Long jobSeekerId);

    Page<Application> findByJobId(Long jobId, Pageable pageable);

    List<Application> findByJobId(Long jobId);

    @Query("SELECT a FROM Application a WHERE a.job.recruiter.id = :recruiterId")
    Page<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.job.id = :jobId AND a.job.recruiter.id = :recruiterId")
    Page<Application> findByJobIdAndRecruiterId(@Param("jobId") Long jobId, @Param("recruiterId") Long recruiterId, Pageable pageable);

    long countByJobId(Long jobId);

    long countByJobSeekerId(Long jobSeekerId);

    long countByStatus(ApplicationStatus status);
}
