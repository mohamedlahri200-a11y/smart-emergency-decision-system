package com.chu.appbackend.service.impl;

import com.chu.appbackend.dto.AuthResponseDTO;
import com.chu.appbackend.dto.LoginRequestDTO;
import com.chu.appbackend.dto.RegisterRequestDTO;
import com.chu.appbackend.entity.RoleType;
import com.chu.appbackend.entity.User;
import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.repository.UserRepository;
import com.chu.appbackend.service.AuthService;
import com.chu.appbackend.service.security.CustomUserDetails;
import com.chu.appbackend.service.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation du service d'authentification.
 * Gere l'inscription des comptes ainsi que la connexion avec emission d'un JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Un compte existe deja avec l'email : " + request.email());
        }
        if (userRepository.existsByMatricule(request.matricule())) {
            throw new DuplicateResourceException("Un compte existe deja avec le matricule : " + request.matricule());
        }

        User user = User.builder()
                .nom(request.nom())
                .prenom(request.prenom())
                .email(request.email())
                .motDePasse(passwordEncoder.encode(request.motDePasse()))
                .matricule(request.matricule())
                .telephone(request.telephone())
                .role(parseRole(request.role()))
                .actif(true)
                .build();

        User savedUser = userRepository.save(user);

        String token = generateTokenForUser(savedUser, request.motDePasse());

        return AuthResponseDTO.of(token, savedUser.getId(), savedUser.getNom(),
                savedUser.getPrenom(), savedUser.getEmail(), savedUser.getRole().name());
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse())
        );

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authentication);
        User user = principal.getUser();

        return AuthResponseDTO.of(token, user.getId(), user.getNom(),
                user.getPrenom(), user.getEmail(), user.getRole().name());
    }

    private String generateTokenForUser(User user, String rawPassword) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), rawPassword)
        );
        return jwtTokenProvider.generateToken(authentication);
    }

    private RoleType parseRole(String role) {
        try {
            return RoleType.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Role invalide : " + role);
        }
    }
}