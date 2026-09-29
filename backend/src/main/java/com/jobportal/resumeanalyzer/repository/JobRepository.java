package com.jobportal.resumeanalyzer.repository;

import com.jobportal.resumeanalyzer.entity.ExperienceLevel;
import com.jobportal.resumeanalyzer.entity.Job;
import com.jobportal.resumeanalyzer.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    @Query("SELECT DISTINCT j FROM Job j " +
           "LEFT JOIN j.requiredSkills s " +
           "WHERE (:status IS NULL OR j.status = :status) " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(s) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)")
    Page<Job> searchAndFilterJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("status") String status,
            Pageable pageable
    );

    Page<Job> findByRecruiterId(Long recruiterId, Pageable pageable);

    List<Job> findByRecruiterId(Long recruiterId);

    long countByStatus(String status);
}
