package com.ecosphere.platform.repository;

import com.ecosphere.platform.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdAndIsRead(Long recipientId, boolean isRead, Pageable pageable);

    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);
}
