package com.chu.appbackend.exception;

/**
 * Exception levée lorsqu'un utilisateur tente une action sans autorisation
 * (identifiants invalides, compte désactivé...).
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}