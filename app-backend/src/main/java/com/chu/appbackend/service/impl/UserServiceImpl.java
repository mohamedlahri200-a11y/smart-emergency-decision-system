package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.ChangePasswordRequestDTO;
import com.chu.appbackend.dto.UpdateUserRequestDTO;
import com.chu.appbackend.dto.UserResponseDTO;
import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation du service de gestion des utilisateurs.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = findUserOrThrow(id);
        return toResponseDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = findUserOrThrow(id);

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Un compte existe deja avec l'email : " + request.email());
        }

        user.setNom(request.nom());
        user.setPrenom(request.prenom());
        user.setEmail(request.email());
        user.setTelephone(request.telephone());
        user.setRole(parseRole(request.role()));

        if (request.actif() != null) {
            user.setActif(request.actif());
        }

        User updated = userRepository.save(user);
        return toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequestDTO request) {
        User user = findUserOrThrow(id);

        if (!passwordEncoder.matches(request.ancienMotDePasse(), user.getMotDePasse())) {
            throw new BadRequestException("L'ancien mot de passe est incorrect");
        }

        user.setMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = findUserOrThrow(id);
        user.setActif(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = findUserOrThrow(id);
        user.setActif(true);
        userRepository.save(user);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + id));
    }

    private RoleType parseRole(String role) {
        try {
            return RoleType.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Role invalide : " + role);
        }
    }

    private UserResponseDTO toResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getEmail(),
                user.getMatricule(),
                user.getTelephone(),
                user.getRole().name(),
                user.getActif(),
                user.getDateCreation()
        );
    }
}