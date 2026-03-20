package com.careerportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    private String mobile;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private LocalDate dob;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String workExperience;

    // Cloudinary URL for resume
    @Column(columnDefinition = "TEXT")
    private String resumeUrl;

    private String resumeFileName;

    private String resumeContentType;

    // Cloudinary URL for photo
    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    private String photoFileName;

    private String photoContentType;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum Status {
        Fresher,
        Experienced
    }

    public enum Gender {
        Male,
        Female,
        Other
    }
}
