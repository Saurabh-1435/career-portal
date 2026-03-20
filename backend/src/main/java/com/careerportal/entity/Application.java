package com.careerportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "job_id", "candidate_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    // Cloudinary URL for resume
    @Column(columnDefinition = "TEXT")
    private String resumeUrl;

    private String resumeFileName;

    private String resumeContentType;

    @Column(nullable = false, updatable = false)
    private Instant appliedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.APPLIED;

    public enum Status {
        APPLIED, REJECTED, SHORTLISTED, INTERVIEW_SCHEDULED, SELECTED
    }

    @PrePersist
    protected void onCreate() {
        appliedAt = Instant.now();
    }
}
