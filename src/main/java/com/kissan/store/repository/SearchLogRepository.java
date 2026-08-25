package com.kissan.store.repository;

import com.kissan.store.model.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, String> {

    @Query("SELECT s.query, COUNT(s) as c FROM SearchLog s GROUP BY s.query ORDER BY c DESC")
    List<Object[]> findTopSearchTrends();
}
