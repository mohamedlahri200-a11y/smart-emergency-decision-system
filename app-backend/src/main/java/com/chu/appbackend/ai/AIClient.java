package com.chu.appbackend.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class AIClient {

    private static final Logger log = LoggerFactory.getLogger(AIClient.class);

    private final RestClient aiRestClient;

    public AIClient(RestClient aiRestClient) {
        this.aiRestClient = aiRestClient;
    }

    /**
     * Appelle le microservice IA pour obtenir une prédiction.
     */
    public PredictResponseDTO predict(PredictRequestDTO request) {

        log.info("Calling AI service: POST /predict");

        try {

            PredictResponseDTO response = aiRestClient.post()
                    .uri("/predict")
                    .body(request)
                    .retrieve()

                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {

                        String body = new String(res.getBody().readAllBytes());

                        log.error("========== FASTAPI CLIENT ERROR ==========");
                        log.error("HTTP Status : {}", res.getStatusCode());
                        log.error("Response    : {}", body);
                        log.error("==========================================");

                        throw new AIServiceException(
                                "Erreur FastAPI : " + body,
                                res.getStatusCode().value()
                        );
                    })

                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {

                        String body = new String(res.getBody().readAllBytes());

                        log.error("========== FASTAPI SERVER ERROR ==========");
                        log.error("HTTP Status : {}", res.getStatusCode());
                        log.error("Response    : {}", body);
                        log.error("==========================================");

                        throw new AIServiceException(
                                "Erreur interne FastAPI : " + body,
                                res.getStatusCode().value()
                        );
                    })

                    .body(PredictResponseDTO.class);

            if (response != null) {

                log.info(
                        "AI prediction received | Priority={} | Service={}",
                        response.priority(),
                        response.recommendedService()
                );
            }

            return response;

        } catch (ResourceAccessException ex) {

            log.error("Unable to reach AI microservice : {}", ex.getMessage());

            throw new AIServiceException(
                    "Microservice IA indisponible (timeout ou connexion refusée)",
                    503
            );
        }
    }

    /**
     * Vérifie l'état de santé du microservice IA.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> health() {

        log.info("Calling AI service: GET /health");

        try {

            return aiRestClient.get()
                    .uri("/health")
                    .retrieve()
                    .body(Map.class);

        } catch (ResourceAccessException ex) {

            throw new AIServiceException(
                    "Microservice IA indisponible",
                    503
            );

        }

    }

    /**
     * Envoie une image (radio/scanner) au CNN de démonstration du
     * microservice IA (POST /predict-imaging, upload multipart).
     */
    public ImagingAnalysisResponseDTO analyserImage(byte[] imageBytes, String nomFichier) {

        log.info("Calling AI service: POST /predict-imaging ({} octets)", imageBytes.length);

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("fichier", new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return nomFichier;
                }
            });

            return aiRestClient.post()
                    .uri("/predict-imaging")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        String errBody = new String(res.getBody().readAllBytes());
                        log.error("Erreur client analyse image : {}", errBody);
                        throw new AIServiceException("Erreur FastAPI (image) : " + errBody, res.getStatusCode().value());
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                        String errBody = new String(res.getBody().readAllBytes());
                        log.error("Erreur serveur analyse image : {}", errBody);
                        throw new AIServiceException("Erreur interne FastAPI (image) : " + errBody, res.getStatusCode().value());
                    })
                    .body(ImagingAnalysisResponseDTO.class);

        } catch (ResourceAccessException ex) {
            log.error("Unable to reach AI microservice (imaging) : {}", ex.getMessage());
            throw new AIServiceException("Microservice IA indisponible (timeout ou connexion refusée)", 503);
        }
    }

}