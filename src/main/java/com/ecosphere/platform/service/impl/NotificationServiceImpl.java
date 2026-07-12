package com.ecosphere.platform.service.impl;

import com.ecosphere.platform.entity.Notification;
import com.ecosphere.platform.entity.User;
import com.ecosphere.platform.exception.ResourceNotFoundException;
import com.ecosphere.platform.repository.NotificationRepository;
import com.ecosphere.platform.repository.UserRepository;
import com.ecosphere.platform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Notification sendNotification(Long recipientId, String message, String type) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + recipientId));
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getNotifications(Long recipientId, Boolean isRead, Pageable pageable) {
        if (isRead != null) {
            return notificationRepository.findByRecipientIdAndIsRead(recipientId, isRead, pageable);
        }
        return notificationRepository.findByRecipientId(recipientId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByUsername(String username, Boolean isRead, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return getNotifications(user.getId(), isRead, pageable);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Page<Notification> unread = notificationRepository.findByRecipientIdAndIsRead(user.getId(), false, Pageable.unpaged());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return notificationRepository.findByRecipientIdAndIsRead(user.getId(), false, Pageable.unpaged()).getTotalElements();
    }
}
