package com.chu.appbackend.ai;

public class AIServiceException extends RuntimeException {
    private final int statusCode;

    public AIServiceException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
    public int getStatusCode() { return statusCode; }
}
