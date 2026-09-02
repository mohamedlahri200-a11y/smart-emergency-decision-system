package com.chu.appbackend.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.reactive.function.client.WebClient;



@RestController
@RequestMapping("/api")
public class AITestController {


    private final WebClient webClient;



    public AITestController(WebClient.Builder builder) {

        this.webClient =
                builder
                        .baseUrl("http://127.0.0.1:8000")
                        .build();

    }




    @GetMapping("/test-ai")
    public String testAI(){


        return webClient
                .get()
                .uri("/api/v1/health")
                .retrieve()
                .bodyToMono(String.class)
                .block();

    }

}