package com.quizapp.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> api(ApiException ex, HttpServletRequest request) {
    return response(ex.status(), ex.getMessage(), request, Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<?> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    Map<String, String> fields = new LinkedHashMap<>();
    for (FieldError field : ex.getBindingResult().getFieldErrors()) {
      fields.putIfAbsent(field.getField(), field.getDefaultMessage());
    }
    return response(HttpStatus.BAD_REQUEST, "One or more fields are invalid.", request, fields);
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<?> denied(AccessDeniedException ex, HttpServletRequest request) {
    return response(HttpStatus.FORBIDDEN, "You are not allowed to perform this action.", request, Map.of());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unknown(Exception ex, HttpServletRequest request) {
    ex.printStackTrace();
    return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.", request, Map.of());
  }

  private ResponseEntity<?> response(HttpStatus status, String message,
                                     HttpServletRequest request, Map<String, String> fields) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now());
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("message", message);
    body.put("path", request.getRequestURI());
    if (!fields.isEmpty()) body.put("fieldErrors", fields);
    return ResponseEntity.status(status).body(body);
  }
}
