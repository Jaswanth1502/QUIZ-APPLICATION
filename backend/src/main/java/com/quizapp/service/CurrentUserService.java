package com.quizapp.service;

import com.quizapp.entity.User;
import com.quizapp.exception.ApiException;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
  private final UserRepository users;

  public User get() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    return users.findByUsernameIgnoreCase(username)
      .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required."));
  }
}
