package com.quizapp.controller;

import com.quizapp.dto.request.SaveAnswerRequest;
import com.quizapp.dto.response.AttemptDtos;
import com.quizapp.service.AttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AttemptController {
  private final AttemptService service;

  @PostMapping("/quizzes/{quizId}/attempts")
  ResponseEntity<AttemptDtos.Start> start(@PathVariable Long quizId) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.start(quizId));
  }

  @GetMapping("/attempts/{id}")
  AttemptDtos.Start active(@PathVariable Long id) { return service.active(id); }

  @PutMapping("/attempts/{id}/answers")
  ResponseEntity<Void> save(@PathVariable Long id, @Valid @RequestBody SaveAnswerRequest request) {
    service.save(id, request);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/attempts/{id}/submit")
  AttemptDtos.Result submit(@PathVariable Long id) { return service.submit(id); }

  @GetMapping("/attempts/{id}/result")
  AttemptDtos.Result result(@PathVariable Long id) { return service.result(id); }

  @GetMapping("/attempts/{id}/review")
  AttemptDtos.Review review(@PathVariable Long id) { return service.review(id); }
}
