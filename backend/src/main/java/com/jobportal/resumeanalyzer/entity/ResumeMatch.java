package com.jobportal.resumeanalyzer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resume_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private Double matchScore; // Percentage 0.0 to 100.0

    private Integer totalRequiredSkillsCount;
    private Integer matchedSkillsCount;
    private Integer missingSkillsCount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "match_matched_skills", joinColumns = @JoinColumn(name = "match_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> matchedSkills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "match_missing_skills", joinColumns = @JoinColumn(name = "match_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> missingSkills = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime calculatedAt;
}
