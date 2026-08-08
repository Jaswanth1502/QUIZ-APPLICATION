package com.quizapp.dto.request;
import jakarta.validation.constraints.*;
public record ProfileUpdateRequest(@NotBlank @Size(max = 120) String fullName, @NotBlank @Email String email) {}
