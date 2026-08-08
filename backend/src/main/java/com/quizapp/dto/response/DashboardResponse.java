package com.quizapp.dto.response;
import java.util.List;
import java.util.Map;
public record DashboardResponse(
  Map<String, Object> statistics,
  List<Map<String, Object>> recent,
  List<Map<String, Object>> chart
) {}
