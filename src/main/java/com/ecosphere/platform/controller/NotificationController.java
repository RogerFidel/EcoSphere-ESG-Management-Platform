package com.ecosphere.platform.controller;

import com.ecosphere.platform.entity.Notification;
import com.ecosphere.platform.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app notification management for all users")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications for the authenticated user, optionally filtered by read status")
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sentAt").descending());
        return ResponseEntity.ok(notificationService.getNotificationsByUsername(auth.getName(), isRead, pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications for the authenticated user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(auth.getName())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(notificationService.markAsRead(id, auth.getName()));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark ALL notifications as read for the authenticated user")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually send a notification to a specific user (Admin only)")
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, Object> body) {
        Long recipientId = ((Number) body.get("recipientId")).longValue();
        String message = (String) body.get("message");
        String type = (String) body.get("type");
        return ResponseEntity.ok(notificationService.sendNotification(recipientId, message, type));
    }
}
