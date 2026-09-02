package com.chu.appbackend.config;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


import java.util.List;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {



    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {


        http


                // Désactiver CSRF pour API REST
                .csrf(csrf -> csrf.disable())


                // Autoriser frontend React
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))


                // Pas de session côté serveur
                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )


                .authorizeHttpRequests(auth -> auth


                        /*
                         ===================================
                         SWAGGER
                         ===================================
                         */
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/documentation-api/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         AUTHENTIFICATION
                         ===================================
                         */
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         MICRO SERVICE IA
                         ===================================
                         */
                        .requestMatchers(
                                "/api/ai/**",
                                "/api/test-ai/**",
                                "/api/test/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         PATIENT
                         ===================================
                         */
                        .requestMatchers(
                                "/api/patients/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         TRIAGE
                         ===================================
                         */
                        .requestMatchers(
                                "/api/triages/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         DECISION IA
                         ===================================
                         */
                        .requestMatchers(
                                "/api/decisions-ia/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         MODULES MEDICAUX
                         ===================================
                         */
                        .requestMatchers(
                                "/api/consultations/**",
                                "/api/examens/**",
                                "/api/traitements/**",
                                "/api/ordonnances/**",
                                "/api/sorties/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         ORIENTATION
                         ===================================
                         */
                        .requestMatchers(
                                "/api/orientations/**",
                                "/api/services-hospitaliers/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         USERS ADMIN
                         ===================================
                         */
                        .requestMatchers(
                                "/api/users/**",
                                "/api/utilisateurs/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         AUDIT + DASHBOARD
                         ===================================
                         */
                        .requestMatchers(
                                "/api/audit/**",
                                "/api/tableau-de-bord/**"
                        )
                        .permitAll()



                        /*
                         ===================================
                         TOUT LE RESTE
                         ===================================
                         */
                        .anyRequest()
                        .permitAll()

                );


        return http.build();

    }




    /*
     ===================================
     Encodeur de mot de passe (BCrypt)
     ===================================
     */

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }




    /*
     ===================================
     AuthenticationManager
     ===================================
     Requis par AuthServiceImpl pour authentifier les identifiants
     (email/mot de passe) lors du login.
     */

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }




    /*
     ===================================
     Configuration CORS
     ===================================
     */

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){


        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://localhost:5173"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(true);



        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;

    }


}