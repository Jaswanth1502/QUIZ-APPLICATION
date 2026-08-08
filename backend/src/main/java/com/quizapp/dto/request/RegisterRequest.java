package com.quizapp.dto.request;
import jakarta.validation.constraints.*;
public record RegisterRequest(
  @NotBlank @Size(max = 120) String fullName,
  @NotBlank @Pattern(regexp = "^[A-Za-z0-9_.-]{3,60}$") String username,
  @NotBlank @Email String email,
  @NotBlank @Size(min = 8, max = 100) String password,
  @NotBlank String confirmPassword
) {}
