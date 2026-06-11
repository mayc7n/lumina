package com.lumina.application.service;

import com.lumina.api.dto.UserResponse;
import com.lumina.api.dto.UserPreferencesResponse;
import com.lumina.api.middleware.GlobalExceptionHandler.BusinessException;
import com.lumina.api.middleware.GlobalExceptionHandler.ConflictException;
import com.lumina.api.middleware.GlobalExceptionHandler.ResourceNotFoundException;
import com.lumina.domain.user.entity.User;
import com.lumina.domain.user.entity.UserPreferences;
import com.lumina.domain.user.repository.UserRepository;
import com.lumina.domain.user.repository.UserPreferencesRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        return UserResponse.from(getUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, Map<String, Object> values) {
        User user = getUser(userId);
        if (values.get("displayName") instanceof String displayName) {
            if (!StringUtils.hasText(displayName) || displayName.trim().length() > 100) {
                throw validation("Nome de exibição inválido");
            }
            user.setDisplayName(displayName.trim());
        }
        if (values.get("username") instanceof String username) {
            String normalized = username.trim().toLowerCase(Locale.ROOT);
            if (!normalized.matches("^[a-z0-9_]{3,50}$")) throw validation("Username inválido");
            userRepository.findByUsernameAndDeletedAtIsNull(normalized)
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> { throw new ConflictException("Este username já está em uso"); });
            user.setUsername(normalized);
        }
        if (values.containsKey("bio")) user.setBio(trimToNull((String) values.get("bio")));
        if (values.get("timezone") instanceof String timezone && StringUtils.hasText(timezone)) user.setTimezone(timezone.trim());
        if (values.get("locale") instanceof String locale && StringUtils.hasText(locale)) user.setLocale(locale.trim());
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserPreferencesResponse getPreferences(UUID userId) {
        getUser(userId);
        return toPreferences(preferencesRepository.findById(userId)
            .orElseGet(() -> UserPreferences.builder().userId(userId).build()));
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public UserPreferencesResponse updatePreferences(UUID userId, Map<String, Object> values) {
        getUser(userId);
        UserPreferences preferences = preferencesRepository.findById(userId)
            .orElseGet(() -> UserPreferences.builder().userId(userId).build());
        if (values.get("theme") instanceof String theme) preferences.setTheme(theme);
        if (values.get("accentColor") instanceof String accent) preferences.setAccentColor(accent);
        if (values.get("weekStartsOn") instanceof Number week) preferences.setWeekStartsOn(week.shortValue());
        if (values.get("dailyGoalHours") instanceof Number hours) preferences.setDailyGoalHours(BigDecimal.valueOf(hours.doubleValue()));
        if (values.get("notificationSettings") instanceof Map<?, ?> settings) {
            preferences.setNotificationSettings(objectMapper.convertValue(settings, Map.class));
        }
        if (values.get("focusSettings") instanceof Map<?, ?> settings) preferences.setFocusSettings(objectMapper.convertValue(settings, Map.class));
        if (values.get("privacySettings") instanceof Map<?, ?> settings) preferences.setPrivacySettings(objectMapper.convertValue(settings, Map.class));
        if (values.get("dashboardLayout") instanceof Map<?, ?> settings) preferences.setDashboardLayout(objectMapper.convertValue(settings, Map.class));
        return toPreferences(preferencesRepository.save(preferences));
    }

    @Transactional(readOnly = true)
    public byte[] exportData(UUID userId) {
        User user = getUser(userId);
        Map<String, Object> export = new LinkedHashMap<>();
        export.put("exportedAt", java.time.Instant.now());
        export.put("profile", UserResponse.from(user));
        export.put("preferences", getPreferences(userId));
        List<String> tables = List.of(
            "tasks", "task_projects", "labels", "habits", "habit_completions",
            "goals", "goal_check_ins", "journal_entries", "books", "book_reading_logs",
            "focus_sessions", "study_subjects", "study_sessions"
        );
        for (String table : tables) {
            export.put(table, jdbcTemplate.queryForList("SELECT * FROM " + table + " WHERE user_id = ?", userId));
        }
        try { return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(export); }
        catch (Exception exception) { throw new IllegalStateException("Falha ao exportar dados", exception); }
    }

    @Transactional
    public void deleteAccount(UUID userId, String confirmation) {
        User user = getUser(userId);
        if (!user.getEmail().equalsIgnoreCase(confirmation)) {
            throw validation("Confirmação de e-mail inválida");
        }
        user.softDelete();
    }

    private User getUser(UUID userId) {
        return userRepository.findActiveById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    private UserPreferencesResponse toPreferences(UserPreferences preferences) {
        return new UserPreferencesResponse(
            preferences.getTheme(), preferences.getAccentColor(), preferences.getWeekStartsOn(),
            preferences.getDailyGoalHours(), preferences.getNotificationSettings(),
            preferences.getFocusSettings(), preferences.getPrivacySettings(), preferences.getDashboardLayout());
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private BusinessException validation(String message) {
        return new BusinessException("VALIDATION_ERROR", message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
