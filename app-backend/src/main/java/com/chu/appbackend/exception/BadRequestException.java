package com.chu.appbackend.exception;

/**
 * Exception levée lorsqu'une requête client est mal formée ou invalide métier.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}