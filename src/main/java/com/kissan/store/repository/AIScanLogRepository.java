package com.kissan.store.repository;

import com.kissan.store.model.AIScanLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIScanLogRepository extends JpaRepository<AIScanLog, String> {

    List<AIScanLog> findAllByOrderByDateDesc();
}
