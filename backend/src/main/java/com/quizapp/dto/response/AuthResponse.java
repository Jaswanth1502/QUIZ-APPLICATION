package com.quizapp.dto.response;
public record AuthResponse(String accessToken, long expiresIn, UserResponse user) {}
