package com.jobportal.resumeanalyzer.service.impl;

import com.jobportal.resumeanalyzer.dto.request.JobRequest;
import com.jobportal.resumeanalyzer.dto.response.JobResponse;
import com.jobportal.resumeanalyzer.dto.response.PagedResponse;
import com.jobportal.resumeanalyzer.entity.*;
import com.jobportal.resumeanalyzer.exception.BadRequestException;
import com.jobportal.resumeanalyzer.exception.ResourceNotFoundException;
import com.jobportal.resumeanalyzer.exception.UnauthorizedException;
import com.jobportal.resumeanalyzer.repository.*;
import com.jobportal.resumeanalyzer.service.JobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;

    @Override
    @Transactional
    public JobResponse createJob(JobRequest request, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        Company company = null;

        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));
        } else if (StringUtils.hasText(request.getCompanyName())) {
            company = companyRepository.findByNameIgnoreCase(request.getCompanyName().trim())
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name(request.getCompanyName().trim())
                            .location(request.getLocation())
                            .build()));
        } else {
            RecruiterProfile profile = recruiterProfileRepository.findByUser(recruiter)
                    .orElse(null);
            if (profile != null && profile.getCompany() != null) {
                company = profile.getCompany();
            }
        }

        if (company == null) {
            throw new BadRequestException("A valid company must be provided or linked to the recruiter profile");
        }

        Job job = Job.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .company(company)
                .recruiter(recruiter)
                .location(request.getLocation().trim())
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .minExperienceYears(request.getMinExperienceYears())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .salaryCurrency(StringUtils.hasText(request.getSalaryCurrency()) ? request.getSalaryCurrency() : "USD")
                .requiredSkills(request.getRequiredSkills() != null ? new ArrayList<>(request.getRequiredSkills()) : new ArrayList<>())
                .niceToHaveSkills(request.getNiceToHaveSkills() != null ? new ArrayList<>(request.getNiceToHaveSkills()) : new ArrayList<>())
                .status("ACTIVE")
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job successfully created: '{}' by {}", savedJob.getTitle(), recruiter.getEmail());

        return mapToJobResponse(savedJob, null);
    }

    @Override
    @Transactional
    public JobResponse updateJob(Long id, JobRequest request, String recruiterEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        User user = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        boolean isOwner = job.getRecruiter().getId().equals(user.getId());
        if (user.getRole() != RoleEnum.ROLE_ADMIN && !isOwner) {
            throw new UnauthorizedException("You are not authorized to edit this job posting");
        }

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));
            job.setCompany(company);
        }

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setLocation(request.getLocation().trim());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setMinExperienceYears(request.getMinExperienceYears());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        if (StringUtils.hasText(request.getSalaryCurrency())) {
            job.setSalaryCurrency(request.getSalaryCurrency());
        }
        if (request.getRequiredSkills() != null) {
            job.setRequiredSkills(new ArrayList<>(request.getRequiredSkills()));
        }
        if (request.getNiceToHaveSkills() != null) {
            job.setNiceToHaveSkills(new ArrayList<>(request.getNiceToHaveSkills()));
        }
        if (StringUtils.hasText(request.getStatus())) {
            job.setStatus(request.getStatus().toUpperCase());
        }

        Job updatedJob = jobRepository.save(job);
        return mapToJobResponse(updatedJob, recruiterEmail);
    }

    @Override
    @Transactional
    public void deleteJob(Long id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean isOwner = job.getRecruiter().getId().equals(user.getId());
        if (user.getRole() != RoleEnum.ROLE_ADMIN && !isOwner) {
            throw new UnauthorizedException("You are not authorized to delete this job posting");
        }

        jobRepository.delete(job);
        log.info("Job deleted with id: {} by user: {}", id, userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id, String currentUserEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        return mapToJobResponse(job, currentUserEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> searchAndFilterJobs(
            String keyword,
            String location,
            JobType jobType,
            ExperienceLevel experienceLevel,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String currentUserEmail
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        String cleanKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        String cleanLocation = StringUtils.hasText(location) ? location.trim() : null;

        Specification<Job> spec = (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), "ACTIVE"));

            if (StringUtils.hasText(cleanKeyword)) {
                String likePattern = "%" + cleanKeyword.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), likePattern);
                Predicate companyMatch = cb.like(cb.lower(root.get("company").get("name")), likePattern);
                predicates.add(cb.or(titleMatch, descMatch, companyMatch));
            }

            if (StringUtils.hasText(cleanLocation)) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + cleanLocation.toLowerCase() + "%"));
            }

            if (jobType != null) {
                predicates.add(cb.equal(root.get("jobType"), jobType));
            }

            if (experienceLevel != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(job -> mapToJobResponse(job, currentUserEmail))
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(jobResponses)
                .pageNumber(jobPage.getNumber())
                .pageSize(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .isLast(jobPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<JobResponse> getRecruiterJobs(String recruiterEmail, int page, int size) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + recruiterEmail));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Job> jobPage = jobRepository.findByRecruiterId(recruiter.getId(), pageable);

        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(job -> mapToJobResponse(job, recruiterEmail))
                .collect(Collectors.toList());

        return PagedResponse.<JobResponse>builder()
                .content(jobResponses)
                .pageNumber(jobPage.getNumber())
                .pageSize(jobPage.getSize())
                .totalElements(jobPage.getTotalElements())
                .totalPages(jobPage.getTotalPages())
                .isLast(jobPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public JobResponse toggleJobStatus(Long id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        boolean isOwner = job.getRecruiter().getId().equals(user.getId());
        if (user.getRole() != RoleEnum.ROLE_ADMIN && !isOwner) {
            throw new UnauthorizedException("You are not authorized to change the status of this job posting");
        }

        job.setStatus("ACTIVE".equalsIgnoreCase(job.getStatus()) ? "CLOSED" : "ACTIVE");
        Job updated = jobRepository.save(job);
        return mapToJobResponse(updated, userEmail);
    }

    private JobResponse mapToJobResponse(Job job, String currentUserEmail) {
        boolean hasApplied = false;
        Double matchScore = null;

        if (StringUtils.hasText(currentUserEmail)) {
            var userOpt = userRepository.findByEmail(currentUserEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getRole() == RoleEnum.ROLE_JOB_SEEKER) {
                    hasApplied = applicationRepository.existsByJobIdAndJobSeekerId(job.getId(), user.getId());

                    JobSeekerProfile profile = jobSeekerProfileRepository.findByUser(user).orElse(null);
                    if (profile != null) {
                        List<String> candidateSkills = new ArrayList<>();
                        if (profile.getActiveResume() != null && profile.getActiveResume().getParsedSkills() != null) {
                            candidateSkills.addAll(profile.getActiveResume().getParsedSkills());
                        } else if (profile.getSkills() != null) {
                            candidateSkills.addAll(profile.getSkills());
                        }

                        if (!candidateSkills.isEmpty() && job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
                            Set<String> normalizedCandidateSkills = candidateSkills.stream()
                                    .map(s -> s.toLowerCase().trim())
                                    .collect(Collectors.toSet());

                            long matchedCount = job.getRequiredSkills().stream()
                                    .filter(req -> normalizedCandidateSkills.contains(req.toLowerCase().trim()))
                                    .count();

                            double score = ((double) matchedCount / job.getRequiredSkills().size()) * 100.0;
                            matchScore = Math.round(score * 10.0) / 10.0;
                        }
                    }
                }
            }
        }

        long count = applicationRepository.countByJobId(job.getId());

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLogoUrl(job.getCompany().getLogoUrl())
                .companyLocation(job.getCompany().getLocation())
                .recruiterId(job.getRecruiter().getId())
                .recruiterName(job.getRecruiter().getFullName())
                .recruiterEmail(job.getRecruiter().getEmail())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .experienceLevel(job.getExperienceLevel())
                .minExperienceYears(job.getMinExperienceYears())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryCurrency(job.getSalaryCurrency())
                .requiredSkills(job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>())
                .niceToHaveSkills(job.getNiceToHaveSkills() != null ? job.getNiceToHaveSkills() : new ArrayList<>())
                .status(job.getStatus())
                .applicantCount(count)
                .hasApplied(hasApplied)
                .seekerMatchScore(matchScore)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
