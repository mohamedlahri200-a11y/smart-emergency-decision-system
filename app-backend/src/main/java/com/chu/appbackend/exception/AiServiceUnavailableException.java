package com.chu.appbackend.exception;

/**
 * Exception levée lorsque le microservice IA (FastAPI) est injoignable
 * ou retourne une erreur lors du traitement de la prédiction.
 */
public class AiServiceUnavailableException extends RuntimeException {
    public AiServiceUnavailableException(String message) {
        super(message);
    }

    public AiServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}









