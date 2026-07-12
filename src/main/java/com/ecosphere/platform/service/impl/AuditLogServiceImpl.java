package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.AuditLog;
import com.ecosphere.platform.repository.AuditLogRepository;
import com.ecosphere.platform.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void log(String username, String action, String details) {
        AuditLog log = AuditLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(String search, Pageable pageable) {
        return auditLogRepository.searchLogs(search, pageable);
    }
}
