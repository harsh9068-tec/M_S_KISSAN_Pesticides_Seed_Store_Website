package com.kissan.store.model;

import jakarta.persistence.*;

@Entity
@Table(name = "search_logs")
public class SearchLog {

    @Id
    private String id;

    @Column(nullable = false)
    private String query;

    private String category;

    private String timestamp;

    private Integer resultCount;

    public SearchLog() {}

    public SearchLog(String id, String query, String category, String timestamp, Integer resultCount) {
        this.id = id;
        this.query = query;
        this.category = category;
        this.timestamp = timestamp;
        this.resultCount = resultCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Integer getResultCount() { return resultCount; }
    public void setResultCount(Integer resultCount) { this.resultCount = resultCount; }
}
