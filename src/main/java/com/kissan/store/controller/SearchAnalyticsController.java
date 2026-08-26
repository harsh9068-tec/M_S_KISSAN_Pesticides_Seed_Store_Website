package com.kissan.store.controller;

import com.kissan.store.model.SearchLog;
import com.kissan.store.service.SearchAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics/searches")
@CrossOrigin(origins = "*")
public class SearchAnalyticsController {

    @Autowired
    private SearchAnalyticsService searchAnalyticsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSearchAnalytics() {
        List<SearchLog> logs = searchAnalyticsService.getAllLogs();
        List<Map<String, Object>> trends = searchAnalyticsService.getTopSearchTrends();
        return ResponseEntity.ok(Map.of(
                "logs", logs,
                "trends", trends
        ));
    }

    @PostMapping
    public ResponseEntity<?> logSearch(@RequestBody Map<String, Object> body) {
        String query = (String) body.get("query");
        String category = (String) body.get("category");
        Integer count = body.get("count") != null ? Integer.parseInt(body.get("count").toString()) : 0;

        SearchLog log = searchAnalyticsService.logSearch(query, category, count);
        return ResponseEntity.ok(Map.of("success", true, "log", log != null ? log : "skipped"));
    }

    @DeleteMapping
    public ResponseEntity<?> clearLogs() {
        searchAnalyticsService.clearLogs();
        return ResponseEntity.ok(Map.of("success", true, "message", "Search logs cleared."));
    }
}
