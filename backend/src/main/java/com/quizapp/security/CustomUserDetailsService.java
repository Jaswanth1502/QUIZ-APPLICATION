package com.quizapp.security;

import com.quizapp.entity.User;
import com.quizapp.enums.AccountStatus;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  @Override
  public UserDetails loadUserByUsername(String value) {
    User user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(value, value)
      .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return org.springframework.security.core.userdetails.User
      .withUsername(user.getUsername())
      .password(user.getPasswordHash())
      .authorities(user.getRoles().stream().map(role -> role.getName()).toArray(String[]::new))
      .disabled(user.getAccountStatus() != AccountStatus.ACTIVE)
      .build();
  }
}
