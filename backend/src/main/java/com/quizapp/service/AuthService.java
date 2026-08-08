package com.quizapp.service;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.entity.*;
import com.quizapp.enums.AccountStatus;
import com.quizapp.exception.ApiException;
import com.quizapp.repository.*;
import com.quizapp.security.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository users;
  private final RoleRepository roles;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authentication;
  private final JwtService jwt;

  @Transactional
  public Tokens register(RegisterRequest request) {
    if (!request.password().equals(request.confirmPassword())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
    }
    if (users.existsByUsernameIgnoreCase(request.username())) {
      throw new ApiException(HttpStatus.CONFLICT, "Username is already registered.");
    }
    if (users.existsByEmailIgnoreCase(request.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email is already registered.");
    }
    Role role = roles.findByName("ROLE_USER")
      .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Default user role is missing."));
    User user = User.builder()
      .fullName(request.fullName().trim())
      .username(request.username().trim())
      .email(request.email().trim().toLowerCase())
      .passwordHash(encoder.encode(request.password()))
      .accountStatus(AccountStatus.ACTIVE)
      .roles(new java.util.HashSet<>(Set.of(role)))
      .build();
    return issue(users.save(user));
  }

  public Tokens login(LoginRequest request) {
    try {
      authentication.authenticate(
        new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password()));
    } catch (AuthenticationException ex) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password.");
    }
    User user = users.findByUsernameIgnoreCaseOrEmailIgnoreCase(
        request.usernameOrEmail(), request.usernameOrEmail())
      .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));
    return issue(user);
  }

  public Tokens refresh(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is missing.");
    }
    try {
      Claims claims = jwt.parse(refreshToken);
      if (!"refresh".equals(claims.get("type", String.class))) throw new IllegalArgumentException();
      User user = users.findByUsernameIgnoreCase(claims.getSubject()).orElseThrow();
      if (user.getAccountStatus() != AccountStatus.ACTIVE) throw new IllegalArgumentException();
      return issue(user);
    } catch (Exception ex) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired.");
    }
  }

  private Tokens issue(User user) {
    var authorities = user.getRoles().stream().map(Role::getName).toList();
    return new Tokens(
      new AuthResponse(jwt.access(user.getUsername(), authorities),
        jwt.accessExpirationSeconds(), UserResponse.from(user)),
      jwt.refresh(user.getUsername(), authorities)
    );
  }

  public record Tokens(AuthResponse response, String refreshToken) {}
}
