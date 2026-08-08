package com.quizapp.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI openAPI() {
    return new OpenAPI()
      .info(new Info().title("QuizForge API").version("v1")
        .description("Interactive quiz platform REST API"))
      .components(new Components().addSecuritySchemes("bearerAuth",
        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
      .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
  }
}
