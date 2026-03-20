package com.careerportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String companyName;

    private String industry;

    private String companySize;

    private String headquarters;

    private String companyType;

    private Integer founded;

    @Column(columnDefinition = "TEXT")
    private String specialities;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String companyPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (status == null) {
            status = Status.PENDING;
        }
    }

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }
}
