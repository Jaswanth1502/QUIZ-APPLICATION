package com.quizapp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class JwtService {
  private final SecretKey key;
  private final long accessMs;
  private final long refreshMs;

  public JwtService(@Value("${app.security.jwt-secret}") String secret,
                    @Value("${app.security.access-expiration-ms}") long accessMs,
                    @Value("${app.security.refresh-expiration-ms}") long refreshMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessMs = accessMs;
    this.refreshMs = refreshMs;
  }

  public String access(String subject, Collection<String> roles) {
    return token(subject, roles, "access", accessMs);
  }

  public String refresh(String subject, Collection<String> roles) {
    return token(subject, roles, "refresh", refreshMs);
  }

  private String token(String subject, Collection<String> roles, String type, long ttl) {
    Instant now = Instant.now();
    return Jwts.builder()
      .subject(subject)
      .claim("roles", roles)
      .claim("type", type)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusMillis(ttl)))
      .signWith(key)
      .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }

  public long accessExpirationSeconds() {
    return accessMs / 1000;
  }
}
