package com.quizapp.service;
import org.junit.jupiter.api.Test;
import java.math.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ScoreFormulaTest {
  @Test
  void calculatesPercentage() {
    BigDecimal value = BigDecimal.valueOf(3).multiply(BigDecimal.valueOf(100))
      .divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
    assertEquals(new BigDecimal("75.00"), value);
  }

  @Test
  void handlesZeroMaximum() {
    BigDecimal maximum = BigDecimal.ZERO;
    BigDecimal value = maximum.signum() == 0 ? BigDecimal.ZERO : BigDecimal.ONE.divide(maximum);
    assertEquals(BigDecimal.ZERO, value);
  }
}
