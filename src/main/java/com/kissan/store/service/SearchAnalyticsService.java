package com.kissan.store.service;

import com.kissan.store.model.SearchLog;
import com.kissan.store.repository.SearchLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchAnalyticsService {

    @Autowired
    private SearchLogRepository searchLogRepository;

    public List<SearchLog> getAllLogs() {
        return searchLogRepository.findAll();
    }

    public SearchLog logSearch(String query, String category, Integer count) {
        if (query == null || query.trim().length() < 2) return null;
        SearchLog log = new SearchLog(
                "srch_" + System.currentTimeMillis(),
                query.trim().toLowerCase(),
                category != null ? category : "all",
                LocalDateTime.now().toString().substring(0, 16).replace("T", " "),
                count != null ? count : 0
        );
        return searchLogRepository.save(log);
    }

    public List<Map<String, Object>> getTopSearchTrends() {
        List<SearchLog> logs = searchLogRepository.findAll();
        Map<String, Integer> counts = new HashMap<>();
        for (SearchLog l : logs) {
            String q = l.getQuery().toLowerCase();
            counts.put(q, counts.getOrDefault(q, 0) + 1);
        }

        List<Map<String, Object>> trends = new ArrayList<>();
        counts.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .forEach(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("query", e.getKey());
                    map.put("count", e.getValue());
                    trends.add(map);
                });
        return trends;
    }

    public void clearLogs() {
        searchLogRepository.deleteAll();
    }
}
