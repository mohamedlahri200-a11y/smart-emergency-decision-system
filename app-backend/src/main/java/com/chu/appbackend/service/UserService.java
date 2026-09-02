

package com.chu.appbackend.service;

import com.chu.appbackend.dto.ChangePasswordRequestDTO;
import com.chu.appbackend.dto.UpdateUserRequestDTO;
import com.chu.appbackend.dto.UserResponseDTO;

import java.util.List;

/**
 * Contrat de service pour la gestion des utilisateurs (hors authentification).
 */
public interface UserService {

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO getUserById(Long id);

    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);

    void deleteUser(Long id);

    void changePassword(Long id, ChangePasswordRequestDTO request);

    void deactivateUser(Long id);

    void activateUser(Long id);
}