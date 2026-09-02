package com.chu.appbackend.ai;

import com.chu.appbackend.ai.AIClient;
import com.chu.appbackend.ai.PredictRequestDTO;
import com.chu.appbackend.ai.PredictResponseDTO;
import org.springframework.stereotype.Service;

import java.util.Map;

        @Service
        public class AIService {

            private final AIClient aiClient;

            public AIService(AIClient aiClient) { this.aiClient = aiClient; }

            public PredictResponseDTO predict(PredictRequestDTO request) {
                return aiClient.predict(request);
            }

            public ImagingAnalysisResponseDTO analyserImage(byte[] imageBytes, String nomFichier) {
                return aiClient.analyserImage(imageBytes, nomFichier);
            }

            public Map<String, Object> health() {
                return aiClient.health();
            }
        }