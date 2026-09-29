package com.jobportal.resumeanalyzer.config;

import com.jobportal.resumeanalyzer.entity.*;
import com.jobportal.resumeanalyzer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobSeekerProfileRepository jobSeekerProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data. Skipping sample data initialization.");
            return;
        }

        log.info("Initializing comprehensive sample data for Job Portal & Resume Analyzer...");

        // 1. Create Default Admin
        User admin = User.builder()
                .email("admin@jobportal.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Platform Administrator")
                .phone("+1-555-0100")
                .role(RoleEnum.ROLE_ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);

        // 2. Create Companies
        Company techCorp = Company.builder()
                .name("TechCorp Solutions")
                .description("Leading enterprise software development and digital transformation consultancy.")
                .website("https://techcorp.example.com")
                .location("San Francisco, CA")
                .industry("Enterprise Software")
                .foundedYear(2015)
                .logoUrl("https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces")
                .build();
        companyRepository.save(techCorp);

        Company cloudScale = Company.builder()
                .name("CloudScale Systems")
                .description("Next-generation cloud infrastructure, Kubernetes orchestration, and DevOps platforms.")
                .website("https://cloudscale.example.io")
                .location("Seattle, WA")
                .industry("Cloud & DevOps")
                .foundedYear(2018)
                .logoUrl("https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces")
                .build();
        companyRepository.save(cloudScale);

        Company nextGenFintech = Company.builder()
                .name("NextGen Fintech")
                .description("High-frequency algorithmic trading and modern decentralized payment infrastructure.")
                .website("https://nextgenfintech.example.com")
                .location("New York, NY")
                .industry("Financial Technology")
                .foundedYear(2020)
                .logoUrl("https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&h=128&fit=crop&crop=faces")
                .build();
        companyRepository.save(nextGenFintech);

        // 3. Create Recruiters
        User recruiterUser1 = User.builder()
                .email("sarah.recruiter@techcorp.com")
                .password(passwordEncoder.encode("Recruiter@123"))
                .fullName("Sarah Jenkins")
                .phone("+1-555-0201")
                .role(RoleEnum.ROLE_RECRUITER)
                .enabled(true)
                .build();
        User savedRecruiter1 = userRepository.save(recruiterUser1);

        RecruiterProfile recruiterProfile1 = RecruiterProfile.builder()
                .user(savedRecruiter1)
                .company(techCorp)
                .designation("Principal Technical Recruiter")
                .department("Engineering Talent Acquisition")
                .build();
        recruiterProfileRepository.save(recruiterProfile1);

        User recruiterUser2 = User.builder()
                .email("alex.hiring@cloudscale.io")
                .password(passwordEncoder.encode("Recruiter@123"))
                .fullName("Alex Rivera")
                .phone("+1-555-0202")
                .role(RoleEnum.ROLE_RECRUITER)
                .enabled(true)
                .build();
        User savedRecruiter2 = userRepository.save(recruiterUser2);

        RecruiterProfile recruiterProfile2 = RecruiterProfile.builder()
                .user(savedRecruiter2)
                .company(cloudScale)
                .designation("Head of Talent")
                .department("Human Resources")
                .build();
        recruiterProfileRepository.save(recruiterProfile2);

        // 4. Create Job Seekers
        User seekerUser1 = User.builder()
                .email("john.doe@gmail.com")
                .password(passwordEncoder.encode("Seeker@123"))
                .fullName("John Doe")
                .phone("+1-555-0301")
                .role(RoleEnum.ROLE_JOB_SEEKER)
                .enabled(true)
                .build();
        User savedSeeker1 = userRepository.save(seekerUser1);

        List<String> johnSkills = Arrays.asList("Java", "Spring Boot", "React", "PostgreSQL", "Docker", "REST API", "Git", "HTML", "CSS");
        String sampleResumeText1 = "John Doe - Senior Full Stack Engineer with 5+ years experience building scalable web applications. " +
                "Expert in Java, Spring Boot, Hibernate, REST API, React, Redux, PostgreSQL, Docker, Git, and Microservices. " +
                "Bachelor of Science in Computer Science.";

        Resume resume1 = Resume.builder()
                .user(savedSeeker1)
                .originalFileName("John_Doe_FullStack_Resume.pdf")
                .storedFileName("demo-john-doe-resume.pdf")
                .fileType("application/pdf")
                .fileSize(142050L)
                .storagePath("uploads/resumes/candidates/demo-john-doe-resume.pdf")
                .extractedText(sampleResumeText1)
                .parsedSkills(new ArrayList<>(johnSkills))
                .build();
        Resume savedResume1 = resumeRepository.save(resume1);

        JobSeekerProfile seekerProfile1 = JobSeekerProfile.builder()
                .user(savedSeeker1)
                .headline("Senior Full Stack Java & React Engineer")
                .bio("Passionate full-stack developer with 5+ years experience architecting secure cloud APIs and responsive React applications.")
                .experienceYears(5)
                .education("B.S. in Computer Science - University of California, Berkeley")
                .location("San Francisco, CA")
                .portfolioUrl("https://johndoe.dev")
                .githubUrl("https://github.com/johndoe")
                .linkedinUrl("https://linkedin.com/in/johndoe")
                .skills(new ArrayList<>(johnSkills))
                .activeResume(savedResume1)
                .build();
        jobSeekerProfileRepository.save(seekerProfile1);

        User seekerUser2 = User.builder()
                .email("emily.chen@gmail.com")
                .password(passwordEncoder.encode("Seeker@123"))
                .fullName("Emily Chen")
                .phone("+1-555-0302")
                .role(RoleEnum.ROLE_JOB_SEEKER)
                .enabled(true)
                .build();
        User savedSeeker2 = userRepository.save(seekerUser2);

        List<String> emilySkills = Arrays.asList("Java", "Spring Boot", "Apache Kafka", "PostgreSQL", "Microservices", "JUnit", "Docker", "AWS");
        String sampleResumeText2 = "Emily Chen - Backend Java Engineer specializing in distributed microservices and Kafka event streaming. " +
                "Skills: Java, Spring Boot, Spring Security, Apache Kafka, PostgreSQL, Docker, AWS, JUnit, Mockito, CI/CD. " +
                "M.S. in Software Engineering.";

        Resume resume2 = Resume.builder()
                .user(savedSeeker2)
                .originalFileName("Emily_Chen_Backend_Resume.pdf")
                .storedFileName("demo-emily-chen-resume.pdf")
                .fileType("application/pdf")
                .fileSize(128400L)
                .storagePath("uploads/resumes/candidates/demo-emily-chen-resume.pdf")
                .extractedText(sampleResumeText2)
                .parsedSkills(new ArrayList<>(emilySkills))
                .build();
        Resume savedResume2 = resumeRepository.save(resume2);

        JobSeekerProfile seekerProfile2 = JobSeekerProfile.builder()
                .user(savedSeeker2)
                .headline("Backend Java & Distributed Systems Developer")
                .bio("Specialized in low-latency event-driven microservices with Spring Boot, Apache Kafka, and PostgreSQL.")
                .experienceYears(4)
                .education("M.S. in Software Engineering - University of Washington")
                .location("Seattle, WA")
                .githubUrl("https://github.com/emilychen")
                .linkedinUrl("https://linkedin.com/in/emilychen")
                .skills(new ArrayList<>(emilySkills))
                .activeResume(savedResume2)
                .build();
        jobSeekerProfileRepository.save(seekerProfile2);

        // 5. Create Jobs
        Job job1 = Job.builder()
                .title("Senior Full Stack Java & React Engineer")
                .description("We are seeking an experienced Full Stack Java Developer to lead our core enterprise product platform. " +
                        "You will design high-throughput REST APIs using Spring Boot, integrate PostgreSQL databases, and build sleek interactive UIs in React.")
                .company(techCorp)
                .recruiter(savedRecruiter1)
                .location("San Francisco, CA (Hybrid)")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.SENIOR_LEVEL)
                .minExperienceYears(4)
                .minSalary(new BigDecimal("130000"))
                .maxSalary(new BigDecimal("165000"))
                .salaryCurrency("USD")
                .requiredSkills(new ArrayList<>(Arrays.asList("Java", "Spring Boot", "PostgreSQL", "React", "Docker", "REST API")))
                .niceToHaveSkills(new ArrayList<>(Arrays.asList("TypeScript", "Tailwind CSS", "AWS", "Kubernetes")))
                .status("ACTIVE")
                .build();
        Job savedJob1 = jobRepository.save(job1);

        Job job2 = Job.builder()
                .title("Lead Cloud & DevOps Architect")
                .description("Join CloudScale Systems to design, maintain, and scale our multi-region Kubernetes clusters. " +
                        "You will automate CI/CD pipelines, configure Terraform infrastructure as code, and optimize AWS container environments.")
                .company(cloudScale)
                .recruiter(savedRecruiter2)
                .location("Seattle, WA (Remote)")
                .jobType(JobType.REMOTE)
                .experienceLevel(ExperienceLevel.LEAD_EXECUTIVE)
                .minExperienceYears(6)
                .minSalary(new BigDecimal("160000"))
                .maxSalary(new BigDecimal("210000"))
                .salaryCurrency("USD")
                .requiredSkills(new ArrayList<>(Arrays.asList("AWS", "Kubernetes", "Docker", "CI/CD", "Terraform", "Linux")))
                .niceToHaveSkills(new ArrayList<>(Arrays.asList("Python", "Ansible", "Nginx", "Apache Kafka")))
                .status("ACTIVE")
                .build();
        jobRepository.save(job2);

        Job job3 = Job.builder()
                .title("Backend Microservices Engineer (Kafka & Spring)")
                .description("Build high-frequency financial transaction processing pipelines using Java 17, Spring Boot, and Apache Kafka. " +
                        "Requires strong experience with ACID transaction isolation, PostgreSQL tuning, and containerized deployments.")
                .company(nextGenFintech)
                .recruiter(savedRecruiter1)
                .location("New York, NY (On-site)")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.MID_LEVEL)
                .minExperienceYears(3)
                .minSalary(new BigDecimal("120000"))
                .maxSalary(new BigDecimal("150000"))
                .salaryCurrency("USD")
                .requiredSkills(new ArrayList<>(Arrays.asList("Java", "Spring Boot", "Apache Kafka", "PostgreSQL", "Microservices", "JUnit")))
                .niceToHaveSkills(new ArrayList<>(Arrays.asList("Redis", "Docker", "AWS", "OAuth")))
                .status("ACTIVE")
                .build();
        Job savedJob3 = jobRepository.save(job3);

        Job job4 = Job.builder()
                .title("Frontend React & TypeScript Specialist")
                .description("Design and implement accessible, ultra-responsive customer-facing web interfaces. " +
                        "Collaborate closely with UI/UX designers and integrate RESTful backend microservices.")
                .company(techCorp)
                .recruiter(savedRecruiter1)
                .location("San Francisco, CA (Remote)")
                .jobType(JobType.REMOTE)
                .experienceLevel(ExperienceLevel.MID_LEVEL)
                .minExperienceYears(3)
                .minSalary(new BigDecimal("110000"))
                .maxSalary(new BigDecimal("140000"))
                .salaryCurrency("USD")
                .requiredSkills(new ArrayList<>(Arrays.asList("React", "TypeScript", "Tailwind CSS", "Redux", "REST API", "HTML", "CSS")))
                .niceToHaveSkills(new ArrayList<>(Arrays.asList("Next.js", "Jest", "Cypress", "GraphQL")))
                .status("ACTIVE")
                .build();
        jobRepository.save(job4);

        Job job5 = Job.builder()
                .title("Junior Software Engineer - Full Stack")
                .description("Fantastic opportunity for an ambitious junior engineer to contribute to enterprise SaaS applications. " +
                        "Mentorship provided in Java Spring Boot and modern frontend frameworks.")
                .company(techCorp)
                .recruiter(savedRecruiter1)
                .location("San Francisco, CA")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.ENTRY_LEVEL)
                .minExperienceYears(1)
                .minSalary(new BigDecimal("80000"))
                .maxSalary(new BigDecimal("100000"))
                .salaryCurrency("USD")
                .requiredSkills(new ArrayList<>(Arrays.asList("Java", "JavaScript", "SQL", "Git", "HTML", "CSS")))
                .niceToHaveSkills(new ArrayList<>(Arrays.asList("Spring Boot", "React", "PostgreSQL")))
                .status("ACTIVE")
                .build();
        jobRepository.save(job5);

        // 6. Seed Sample Applications & Resume Matches
        // John Doe applies to Job 1 (Senior Full Stack Java & React Engineer)
        ResumeMatch match1 = ResumeMatch.builder()
                .resume(savedResume1)
                .job(savedJob1)
                .matchScore(100.0)
                .totalRequiredSkillsCount(6)
                .matchedSkillsCount(6)
                .missingSkillsCount(0)
                .matchedSkills(new ArrayList<>(Arrays.asList("Java", "Spring Boot", "PostgreSQL", "React", "Docker", "REST API")))
                .missingSkills(new ArrayList<>())
                .build();

        Application app1 = Application.builder()
                .job(savedJob1)
                .jobSeeker(savedSeeker1)
                .resume(savedResume1)
                .status(ApplicationStatus.SHORTLISTED)
                .coverLetter("I am thrilled to apply for the Senior Full Stack role. With over 5 years in Java and React development, I look forward to contributing immediately to your team.")
                .resumeMatch(match1)
                .build();
        applicationRepository.save(app1);

        // Emily Chen applies to Job 3 (Backend Microservices)
        ResumeMatch match2 = ResumeMatch.builder()
                .resume(savedResume2)
                .job(savedJob3)
                .matchScore(100.0)
                .totalRequiredSkillsCount(6)
                .matchedSkillsCount(6)
                .missingSkillsCount(0)
                .matchedSkills(new ArrayList<>(Arrays.asList("Java", "Spring Boot", "Apache Kafka", "PostgreSQL", "Microservices", "JUnit")))
                .missingSkills(new ArrayList<>())
                .build();

        Application app2 = Application.builder()
                .job(savedJob3)
                .jobSeeker(savedSeeker2)
                .resume(savedResume2)
                .status(ApplicationStatus.APPLIED)
                .coverLetter("I have extensive experience building real-time Kafka event streaming architectures with Spring Boot and PostgreSQL.")
                .resumeMatch(match2)
                .build();
        applicationRepository.save(app2);

        log.info("Sample data initialization complete! Demo users ready: admin@jobportal.com, sarah.recruiter@techcorp.com, john.doe@gmail.com (Password: Seeker@123 / Recruiter@123 / Admin@123)");
    }
}
