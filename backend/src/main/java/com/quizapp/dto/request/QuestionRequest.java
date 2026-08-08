package com.quizapp.dto.request;
import com.quizapp.enums.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record QuestionRequest(
  @NotBlank String questionText,
  @NotNull Long categoryId,
  @NotNull Difficulty difficulty,
  @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal marks,
  String explanation,
  @NotNull @Size(min = 4) List<@Valid OptionRequest> options
) {
  public record OptionRequest(@NotBlank String optionText, boolean correct, @Min(1) int displayOrder) {}
}
