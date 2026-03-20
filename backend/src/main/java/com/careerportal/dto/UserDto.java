package com.careerportal.dto;

import com.careerportal.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Set<User.Role> roles;
    private Instant createdAt;
}
