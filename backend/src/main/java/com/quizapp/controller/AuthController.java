package com.quizapp.controller;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.service.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService auth;
  private final UserService users;

  @PostMapping("/register")
  ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                        HttpServletResponse response) {
    return issue(auth.register(request), response, HttpStatus.CREATED);
  }

  @PostMapping("/login")
  ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                     HttpServletResponse response) {
    return issue(auth.login(request), response, HttpStatus.OK);
  }

  @PostMapping("/refresh")
  ResponseEntity<AuthResponse> refresh(
      @CookieValue(name = "refresh_token", required = false) String token,
      HttpServletResponse response) {
    return issue(auth.refresh(token), response, HttpStatus.OK);
  }

  @PostMapping("/logout")
  ResponseEntity<Void> logout(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
      .httpOnly(true).secure(false).sameSite("Lax")
      .path("/api/v1/auth").maxAge(0).build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/me")
  UserResponse me() {
    return users.me();
  }

  private ResponseEntity<AuthResponse> issue(AuthService.Tokens tokens,
                                             HttpServletResponse response,
                                             HttpStatus status) {
    ResponseCookie cookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
      .httpOnly(true).secure(false).sameSite("Lax")
      .path("/api/v1/auth").maxAge(Duration.ofDays(7)).build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    return ResponseEntity.status(status).body(tokens.response());
  }
}
