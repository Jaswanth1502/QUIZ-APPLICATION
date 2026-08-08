package com.quizapp.dto.request;
import jakarta.validation.constraints.*;
public record PasswordUpdateRequest(@NotBlank String currentPassword, @NotBlank @Size(min = 8, max = 100) String newPassword) {}
