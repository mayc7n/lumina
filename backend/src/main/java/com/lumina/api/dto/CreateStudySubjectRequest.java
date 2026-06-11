package com.lumina.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateStudySubjectRequest(
    @NotBlank String name, String description, String color,
    String icon, Double goalHours
) {}
