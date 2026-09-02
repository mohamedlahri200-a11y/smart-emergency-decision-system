package com.chu.appbackend.service;

import com.chu.appbackend.dto.AuthResponseDTO;
import com.chu.appbackend.dto.LoginRequestDTO;
import com.chu.appbackend.dto.RegisterRequestDTO;

/**
 * Contrat de service pour l'authentification des utilisateurs.
 */
public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);
}