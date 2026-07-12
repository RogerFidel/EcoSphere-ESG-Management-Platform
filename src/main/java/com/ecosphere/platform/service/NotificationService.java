package com.ecosphere.platform.service;

import com.ecosphere.platform.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Notification sendNotification(Long recipientId, String message, String type);
    Page<Notification> getNotifications(Long recipientId, Boolean isRead, Pageable pageable);
    Page<Notification> getNotificationsByUsername(String username, Boolean isRead, Pageable pageable);
    Notification markAsRead(Long notificationId, String username);
    void markAllAsRead(String username);
    long countUnread(String username);
}
