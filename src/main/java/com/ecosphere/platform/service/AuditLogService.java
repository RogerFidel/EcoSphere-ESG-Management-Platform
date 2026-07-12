package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    void log(String username, String action, String details);
    Page<AuditLog> getLogs(String search, Pageable pageable);
}
