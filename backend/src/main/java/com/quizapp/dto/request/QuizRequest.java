package com.quizapp.dto.request;
import com.quizapp.enums.Difficulty;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record QuizRequest(
  @NotBlank @Size(max = 180) String title,
  String description,
  @NotNull Long categoryId,
  @NotNull Difficulty difficulty,
  @NotNull @Min(1) Integer durationMinutes,
  @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal passingPercentage
) {}
