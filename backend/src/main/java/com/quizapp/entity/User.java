package com.quizapp.entity;

import com.quizapp.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_users_status", columnList = "account_status"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String fullName;

  @Column(nullable = false, unique = true, length = 60)
  private String username;

  @Column(nullable = false, unique = true, length = 160)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private AccountStatus accountStatus = AccountStatus.ACTIVE;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "user_roles",
      joinColumns = @JoinColumn(name = "user_id"),
      inverseJoinColumns = @JoinColumn(name = "role_id"))
  @Builder.Default
  private Set<Role> roles = new HashSet<>();
}
