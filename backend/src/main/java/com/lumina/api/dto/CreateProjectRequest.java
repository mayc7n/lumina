package com.lumina.api.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateProjectRequest(
    @NotBlank @Size(max = 100) String name,
    String description, String color, String icon
) {}
