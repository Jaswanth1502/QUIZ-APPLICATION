package com.quizapp.service;

import com.quizapp.dto.request.RegisterRequest;
import com.quizapp.repository.*;
import com.quizapp.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class AuthServiceTest {
  @Test
  void rejectsPasswordMismatch() {
    AuthService service = new AuthService(
      mock(UserRepository.class), mock(RoleRepository.class),
      mock(PasswordEncoder.class), mock(AuthenticationManager.class), mock(JwtService.class));
    assertThrows(RuntimeException.class, () -> service.register(
      new RegisterRequest("Test User", "tester", "test@example.com", "Password1", "Different1")));
  }
}
