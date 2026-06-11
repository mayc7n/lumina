package com.lumina.api.dto;

public record CreateStudySessionRequest(
    String subjectId, Integer durationMins, String title,
    String notes, Short quality
) {}
