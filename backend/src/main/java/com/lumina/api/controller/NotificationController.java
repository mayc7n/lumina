package com.lumina.api.controller;

import com.lumina.api.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    @GetMapping
    public ApiResponse<List<Object>> getNotifications() {
        return ApiResponse.success(List.of());
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount() {
        return ApiResponse.success(new UnreadCountResponse(0));
    }

    private record UnreadCountResponse(int count) {}
}
