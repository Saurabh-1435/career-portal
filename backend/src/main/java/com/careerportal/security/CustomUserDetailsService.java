package com.careerportal.security;

import com.careerportal.entity.User;
import com.careerportal.repository.CandidateRepository;
import com.careerportal.repository.CompanyRepository;
import com.careerportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final CompanyRepository companyRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        Long profileId = null;
        var cand = candidateRepository.findByUserId(user.getId());
        if (cand.isPresent()) {
            profileId = cand.get().getId();
        } else {
            var comp = companyRepository.findByUserId(user.getId());
            if (comp.isPresent()) {
                profileId = comp.get().getId();
            }
        }
        return UserPrincipal.from(user, profileId);
    }
}
