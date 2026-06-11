package com.lumina.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateBookRequest(
    @NotBlank String title, String author, String coverUrl,
    Integer totalPages, String status, String genre,
    String googleBooksId, List<String> tags
) {}
