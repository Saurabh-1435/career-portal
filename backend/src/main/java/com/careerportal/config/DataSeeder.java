package com.careerportal.config;

import com.careerportal.entity.User;
import com.careerportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@careerportal.com");
            admin.setPassword(passwordEncoder.encode("Ankita_Shinde@121!"));
            admin.setRoles(Set.of(User.Role.ROLE_ADMIN));
            userRepository.save(admin);
        }
    }
}
