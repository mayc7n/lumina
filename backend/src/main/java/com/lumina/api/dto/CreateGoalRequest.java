package com.lumina.api.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateGoalRequest(
    @NotBlank @Size(max = 200) String title,
    String description, String icon, String color,
    @NotBlank String period,
    String startDate, String endDate,
    Double targetValue, String unit,
    Boolean isPublic
) {}
