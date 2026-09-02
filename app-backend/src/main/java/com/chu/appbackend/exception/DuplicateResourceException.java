package com.chu.appbackend.exception;

/**
 * Exception levée lorsqu'une ressource unique existe déjà (email, matricule...).
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}