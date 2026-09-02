package com.chu.appbackend.exception;

/**
 * Exception levée lorsqu'une ressource demandée est introuvable.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}