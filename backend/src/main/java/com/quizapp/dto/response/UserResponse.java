package com.quizapp.dto.response;
import com.quizapp.entity.User;
import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserResponse(
  Long id, String fullName, String username, String email,
  String status, Set<String> roles, Instant createdAt
) {
  public static UserResponse from(User user) {
    return new UserResponse(
      user.getId(), user.getFullName(), user.getUsername(), user.getEmail(),
      user.getAccountStatus().name(),
      user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()),
      user.getCreatedAt()
    );
  }
}
