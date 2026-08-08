package com.quizapp.controller;

import com.quizapp.dto.request.*;
import com.quizapp.dto.response.*;
import com.quizapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {
  private final UserService service;

  @GetMapping
  UserResponse me() { return service.me(); }

  @PutMapping
  UserResponse update(@Valid @RequestBody ProfileUpdateRequest request) {
    return service.update(request);
  }

  @PutMapping("/password")
  ResponseEntity<Void> password(@Valid @RequestBody PasswordUpdateRequest request) {
    service.password(request);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/dashboard")
  DashboardResponse dashboard() { return service.dashboard(); }

  @GetMapping("/attempts")
  Page<AttemptDtos.Result> attempts(
      @PageableDefault(size = 10, sort = "startedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return service.history(pageable);
  }
}
