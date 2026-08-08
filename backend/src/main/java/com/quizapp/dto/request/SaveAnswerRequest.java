package com.quizapp.dto.request;
import jakarta.validation.constraints.NotNull;
public record SaveAnswerRequest(@NotNull Long questionId, Long selectedOptionId) {}
