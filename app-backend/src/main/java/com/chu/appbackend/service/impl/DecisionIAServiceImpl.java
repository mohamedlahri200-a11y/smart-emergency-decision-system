package com.chu.appbackend.service.impl;


import com.chu.appbackend.ai.AIService;
import com.chu.appbackend.ai.PatientAIDTO;
import com.chu.appbackend.ai.PredictRequestDTO;
import com.chu.appbackend.ai.PredictResponseDTO;

import com.chu.appbackend.dto.*;
        import com.chu.appbackend.entity.*;

        import com.chu.appbackend.exception.BadRequestException;
import com.chu.appbackend.exception.DuplicateResourceException;
import com.chu.appbackend.exception.ResourceNotFoundException;

import com.chu.appbackend.repository.DecisionIARepository;
import com.chu.appbackend.repository.PatientRepository;
import com.chu.appbackend.repository.TriageRepository;
import com.chu.appbackend.repository.UserRepository;

import com.chu.appbackend.service.DecisionIAService;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Arrays;
import java.util.List;
import com.chu.appbackend.ai.LabImagingResultsAIDTO;



@Service
@RequiredArgsConstructor
@Slf4j
public class DecisionIAServiceImpl implements DecisionIAService {



    private final DecisionIARepository decisionIARepository;

    private final TriageRepository triageRepository;

    private final PatientRepository patientRepository;

    private final UserRepository userRepository;

    private final AIService aiService;

    private final ObjectMapper objectMapper;



    // =====================================================
    // GENERER DECISION IA
    // =====================================================


    @Override
    @Transactional
    public DecisionIAResponseDTO genererDecision(
            DecisionIARequestDTO request
    ){


        Triage triage =
                triageRepository.findById(request.triageId())

                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Triage introuvable : "
                                                        + request.triageId()
                                        )
                        );



        if(decisionIARepository
                .findByTriageId(triage.getId())
                .isPresent()){


            throw new DuplicateResourceException(
                    "Une décision IA existe déjà pour ce triage"
            );

        }




        Patient patient = triage.getPatient();



        PredictRequestDTO payload =
                buildAIPayload(patient,triage);



        PredictResponseDTO prediction =
                aiService.predict(payload);





        DecisionIA decision =
                DecisionIA.builder()

                        .patient(patient)

                        .triage(triage)

                        .donneesEnvoyees(
                                serialize(payload)
                        )

                        .scorePrediction(
                                prediction.confidenceScore()
                        )

                        .classePredite(
                                prediction.priority()
                        )

                        .recommandationService(
                                prediction.recommendedService()
                        )

                        .explication(
                                prediction.aiExplanation()!=null
                                        ?
                                        prediction.aiExplanation().summary()
                                        :
                                        null
                        )

                        .reponseComplete(
                                serialize(prediction)
                        )

                        .statutValidation(
                                StatutValidation.EN_ATTENTE
                        )

                        .build();



        DecisionIA saved =
                decisionIARepository.save(decision);



        log.info(
                "Décision IA créée id={} priorité={} service={}",
                saved.getId(),
                prediction.priority(),
                prediction.recommendedService()
        );



        return toResponseDTO(saved);

    }


    // =====================================================
    // ANALYSE COMPLEMENTAIRE (2EME ANALYSE IA)
    // =====================================================
    // Appelée par le médecin urgentiste une fois les résultats du
    // radiologue et du biologiste reçus. Réutilise les mêmes constantes
    // vitales de triage, mais y ajoute les résultats d'examens
    // structurés saisis par le médecin, et met à jour la décision IA
    // existante (au lieu d'en créer une nouvelle) en réinitialisant son
    // statut à EN_ATTENTE pour une nouvelle validation médicale.

    @Override
    @Transactional
    public DecisionIAResponseDTO genererAnalyseComplementaire(
            Long triageId,
            AnalyseComplementaireRequestDTO labo
    ) {
        Triage triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new ResourceNotFoundException("Triage introuvable : " + triageId));

        DecisionIA decision = decisionIARepository.findByTriageId(triageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucune décision IA initiale trouvée pour ce triage — l'analyse au triage doit être réalisée avant l'analyse complémentaire."
                ));

        Patient patient = triage.getPatient();

        PredictRequestDTO payload = buildAIPayload(patient, triage);
        payload.setLab_imaging_results(toLabImagingAIDTO(labo));

        PredictResponseDTO prediction = aiService.predict(payload);

        decision.setDonneesEnvoyees(serialize(payload));
        decision.setScorePrediction(prediction.confidenceScore());
        decision.setClassePredite(prediction.priority());
        decision.setRecommandationService(prediction.recommendedService());
        decision.setExplication(
                prediction.aiExplanation() != null ? prediction.aiExplanation().summary() : null
        );
        decision.setReponseComplete(serialize(prediction));
        decision.setStatutValidation(StatutValidation.EN_ATTENTE);
        decision.setMedecinValidateur(null);
        decision.setCommentaireMedecin(null);
        decision.setDateValidation(null);

        DecisionIA saved = decisionIARepository.save(decision);

        log.info(
                "Analyse complémentaire appliquée id={} nouveau service={} risque_deterioration={}",
                saved.getId(),
                prediction.recommendedService(),
                prediction.deteriorationRisk()
        );

        return toResponseDTO(saved);
    }

    private LabImagingResultsAIDTO toLabImagingAIDTO(AnalyseComplementaireRequestDTO r) {
        LabImagingResultsAIDTO dto = new LabImagingResultsAIDTO();
        dto.setCrp(r.crp());
        dto.setProcalcitonine(r.procalcitonine());
        dto.setLeucocytes(r.leucocytes());
        dto.setHemoglobine(r.hemoglobine());
        dto.setCreatinine(r.creatinine());
        dto.setTroponine(r.troponine());
        dto.setLactate(r.lactate());
        dto.setGlycemie_labo(r.glycemieLabo());
        dto.setImagerie_anomalie(r.imagerieAnomalie() != null ? r.imagerieAnomalie() : false);
        dto.setImagerie_details(r.imagerieDetails());
        return dto;
    }




    // =====================================================
    // CONSTRUCTION PAYLOAD IA
    // =====================================================


    private PredictRequestDTO buildAIPayload(
            Patient patient,
            Triage triage
    ){


        int age = 0;


        if(patient.getDateNaissance()!=null){

            age =
                    Period.between(
                                    patient.getDateNaissance(),
                                    LocalDate.now()
                            )
                            .getYears();

        }



        PatientAIDTO dto =
                new PatientAIDTO();



        dto.setPatient_id(
                String.valueOf(patient.getId())
        );


        dto.setAge(age);



        dto.setSexe(
                mapSexe(patient.getSexe())
        );



        dto.setPoids(
                triage.getPoids()!=null
                        &&
                        triage.getPoids()>0
                        ?
                        triage.getPoids()
                        :
                        70.0
        );



        dto.setTaille(
                triage.getTaille()!=null
                        &&
                        triage.getTaille()>0
                        ?
                        triage.getTaille()
                        :
                        170.0
        );



        dto.setTemperature(
                triage.getTemperature()!=null
                        ?
                        triage.getTemperature()
                        :
                        37.0
        );



        dto.setFrequence_cardiaque(
                triage.getFrequenceCardiaque()!=null
                        ?
                        triage.getFrequenceCardiaque()
                        :
                        80
        );



        dto.setPression_arterielle_systolique(
                triage.getPressionArterielleSystolique()!=null
                        ?
                        triage.getPressionArterielleSystolique()
                        :
                        120
        );



        dto.setPression_arterielle_diastolique(
                triage.getPressionArterielleDiastolique()!=null
                        ?
                        triage.getPressionArterielleDiastolique()
                        :
                        80
        );



        dto.setFrequence_respiratoire(
                triage.getFrequenceRespiratoire()!=null
                        ?
                        triage.getFrequenceRespiratoire()
                        :
                        18
        );



        dto.setSaturation_o2(
                triage.getSaturationOxygene()!=null
                        ?
                        triage.getSaturationOxygene().doubleValue()
                        :
                        98.0
        );



        // Valeur normale moyenne en g/L (au lieu de 5.5, qui correspond
        // à une hyperglycémie sévère et fausserait l'analyse IA).
        dto.setGlycemie(
                triage.getGlycemie()!=null
                        &&
                        triage.getGlycemie()>0
                        ?
                        triage.getGlycemie()
                        :
                        1.0
        );



        dto.setDouleur_eva(
                triage.getDouleurIntensite()!=null
                        ?
                        triage.getDouleurIntensite()
                        :
                        0
        );



        dto.setScore_news2(
                triage.getScoreNews2()!=null
                        ?
                        triage.getScoreNews2()
                        :
                        0
        );



        dto.setScore_esi(
                triage.getNiveauEsi()!=null
                        ?
                        triage.getNiveauEsi()
                        :
                        5
        );



        dto.setScore_gcs(
                mapNiveauConscienceToGcs(
                        triage.getNiveauConscience()
                )
        );



        dto.setAntecedents(
                splitToList(patient.getAntecedents())
        );


        dto.setAllergies(
                splitToList(patient.getAllergies())
        );


        // Le schéma FastAPI exige au moins un symptôme (min_length=1) :
        // on retombe sur une valeur neutre si rien n'a été saisi, pour
        // éviter un rejet 422 de l'analyse IA.
        List<String> symptomesExtraits = splitToList(triage.getSymptomes());
        dto.setSymptomes(
                !symptomesExtraits.isEmpty()
                        ? symptomesExtraits
                        : List.of("motif_non_precise")
        );



        // Correction : pas encore présent dans Entity Triage
        dto.setMode_arrivee(
                "PROPRE_MOYEN"
        );



        PredictRequestDTO request =
                new PredictRequestDTO();


        request.setPatient(dto);

        request.setInclude_explanation(true);



        return request;

    }    // =====================================================
    // GET DECISION PAR ID
    // =====================================================


    @Override
    public DecisionIAResponseDTO getDecisionById(Long id){


        DecisionIA decision =
                findDecisionOrThrow(id);


        return toResponseDTO(decision);

    }






    // =====================================================
    // GET TOUTES LES DECISIONS
    // =====================================================


    @Override
    public List<DecisionIAResponseDTO> getAllDecisions(){


        return decisionIARepository
                .findAllByOrderByDateDecisionDesc()

                .stream()

                .map(this::toResponseDTO)

                .toList();

    }






    // =====================================================
    // HISTORIQUE IA PAR PATIENT
    // =====================================================


    @Override
    public List<DecisionIAResponseDTO> getHistoriqueByPatient(
            Long patientId
    ){


        if(!patientRepository.existsById(patientId)){


            throw new ResourceNotFoundException(
                    "Patient introuvable : "
                            + patientId
            );

        }



        return decisionIARepository

                .findByPatientIdOrderByDateDecisionDesc(patientId)

                .stream()

                .map(this::toResponseDTO)

                .toList();


    }






    // =====================================================
    // VALIDATION MEDECIN
    // =====================================================


    @Override
    @Transactional
    public DecisionIAResponseDTO validerDecision(
            Long id,
            ValidationDecisionDTO request
    ){



        DecisionIA decision =
                findDecisionOrThrow(id);




        User medecin =
                userRepository
                        .findById(
                                request.medecinValidateurId()
                        )

                        .orElseThrow(

                                () ->
                                        new ResourceNotFoundException(
                                                "Médecin introuvable"
                                        )

                        );





        if(medecin.getRole()!=RoleType.MEDECIN){


            throw new BadRequestException(
                    "Seul un médecin peut valider une décision IA"
            );

        }




        StatutValidation statut =
                parseStatut(
                        request.statutValidation()
                );




        if(statut==StatutValidation.EN_ATTENTE){


            throw new BadRequestException(
                    "Le statut doit être VALIDEE, REJETEE ou MODIFIEE"
            );

        }




        decision.setMedecinValidateur(
                medecin
        );



        decision.setStatutValidation(
                statut
        );



        decision.setCommentaireMedecin(
                request.commentaireMedecin()
        );



        decision.setDateValidation(
                LocalDateTime.now()
        );




        DecisionIA updated =
                decisionIARepository.save(decision);




        return toResponseDTO(updated);

    }






    // =====================================================
    // MAPPING SEXE
    // =====================================================


    private String mapSexe(Object sexeEnum){



        if(sexeEnum==null){


            throw new BadRequestException(
                    "Le sexe du patient est obligatoire"
            );

        }




        String value =
                sexeEnum.toString()
                        .toUpperCase()
                        .replace("É","E");





        return switch(value){


            case "M",
                 "MASCULIN",
                 "HOMME",
                 "MALE"
                    ->
                    "M";



            case "F",
                 "FEMININ",
                 "FEMME",
                 "FEMALE"
                    ->
                    "F";



            default -> {


                log.error(
                        "Sexe inconnu : {}",
                        value
                );


                throw new BadRequestException(
                        "Sexe non reconnu : "
                                + value
                );

            }

        };


    }








    // =====================================================
    // NIVEAU CONSCIENCE -> GCS
    // =====================================================


    private Integer mapNiveauConscienceToGcs(
            Object niveauConscience
    ){



        if(niveauConscience==null){

            return 15;

        }




        String value =
                niveauConscience.toString()
                        .toUpperCase()
                        .replace("É","E");





        return switch(value){


            case "CONSCIENT",
                 "NORMAL",
                 "VIGILANT",
                 "ALERTE"
                    ->
                    15;



            case "CONFUS",
                 "CONFUSION"
                    ->
                    14;



            case "SOMNOLENT",
                 "SOMNOLENCE",
                 "LETHARGIQUE"
                    ->
                    11;



            case "COMATEUX",
                 "INCONSCIENT",
                 "COMA"
                    ->
                    6;



            default -> {


                log.warn(
                        "Niveau conscience non reconnu : {}",
                        value
                );


                yield 15;

            }

        };


    }







    // =====================================================
    // STRING -> LIST
    // =====================================================


    private List<String> splitToList(
            String text
    ){



        if(text==null || text.isBlank()){


            return List.of();

        }




        return Arrays.stream(
                        text.split("[,;|]")
                )


                .map(String::trim)


                .filter(
                        s -> !s.isBlank()
                )


                .toList();


    }






    // =====================================================
    // FIND DECISION
    // =====================================================


    private DecisionIA findDecisionOrThrow(
            Long id
    ){



        return decisionIARepository
                .findById(id)

                .orElseThrow(

                        () ->
                                new ResourceNotFoundException(
                                        "Décision IA introuvable : "
                                                + id
                                )

                );


    }








    // =====================================================
    // PARSE STATUT
    // =====================================================


    private StatutValidation parseStatut(
            String statut
    ){



        try{


            return StatutValidation
                    .valueOf(
                            statut.toUpperCase()
                    );


        }

        catch(Exception e){


            throw new BadRequestException(
                    "Statut invalide : "
                            + statut
            );

        }


    }








    // =====================================================
    // SERIALIZE
    // =====================================================


    private String serialize(
            Object object
    ){


        try{


            return objectMapper
                    .writeValueAsString(object);



        }

        catch(Exception e){



            log.error(
                    "Erreur sérialisation JSON",
                    e
            );



            throw new BadRequestException(
                    "Erreur conversion données IA"
            );


        }


    }








    // =====================================================
    // ENTITY -> DTO
    // =====================================================


    private DecisionIAResponseDTO toResponseDTO(
            DecisionIA d
    ){

        PredictResponseDTO reponseIA =
                parseReponseComplete(d.getReponseComplete());

        return new DecisionIAResponseDTO(


                d.getId(),


                d.getPatient().getId(),


                d.getPatient().getNom()
                        +" "
                        +
                        d.getPatient().getPrenom(),



                d.getTriage().getId(),



                d.getMedecinValidateur()!=null
                        ?
                        d.getMedecinValidateur().getId()
                        :
                        null,



                d.getMedecinValidateur()!=null
                        ?
                        d.getMedecinValidateur()
                        .getNom()
                        +" "
                        +
                                d.getMedecinValidateur()
                                .getPrenom()
                        :
                        null,



                d.getScorePrediction(),



                d.getClassePredite(),



                d.getRecommandationService(),



                d.getExplication(),



                d.getStatutValidation()
                        .name(),



                d.getCommentaireMedecin(),



                d.getDateDecision(),



                d.getDateValidation(),


                // ---- Champs enrichis reconstruits depuis reponse_complete ----

                reponseIA != null ? reponseIA.recommendedExams() : List.of(),

                reponseIA != null ? reponseIA.recommendedLabTests() : List.of(),

                reponseIA != null ? reponseIA.clinicalRisk() : null,

                reponseIA != null ? reponseIA.deteriorationRisk() : null,

                reponseIA != null ? reponseIA.estimatedLengthOfStay() : null,

                reponseIA != null ? reponseIA.estimatedWaitingTime() : null,

                reponseIA != null ? reponseIA.identifiedRiskFactors() : List.of(),

                reponseIA != null ? reponseIA.activeAlerts() : List.of(),

                reponseIA != null ? reponseIA.recommendedProtocols() : List.of(),

                reponseIA != null ? reponseIA.patientRecommendations() : List.of(),

                reponseIA != null ? reponseIA.aiExplanation() : null,

                reponseIA != null ? reponseIA.modelVersion() : null,

                reponseIA != null ? reponseIA.confidenceScore() : d.getScorePrediction()

        );

    }



    // =====================================================
    // DESERIALISATION REPONSE IA COMPLETE
    // =====================================================

    private PredictResponseDTO parseReponseComplete(String json){

        if(json == null || json.isBlank()){
            return null;
        }

        try{

            return objectMapper.readValue(json, PredictResponseDTO.class);

        }
        catch(Exception e){

            log.warn(
                    "Impossible de désérialiser reponse_complete : {}",
                    e.getMessage()
            );

            return null;

        }

    }


}