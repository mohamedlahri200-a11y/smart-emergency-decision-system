package com.chu.appbackend.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Structure uniforme de réponse d'erreur renvoyée par l'API.
 */
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {}