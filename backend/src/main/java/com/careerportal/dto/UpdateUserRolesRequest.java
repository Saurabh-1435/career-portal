package com.careerportal.dto;

import com.careerportal.entity.User;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRolesRequest {
    @NotEmpty(message = "At least one role is required")
    private Set<User.Role> roles;
}
