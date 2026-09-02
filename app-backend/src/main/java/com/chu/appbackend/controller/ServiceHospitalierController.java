package com.chu.appbackend.controller;

import com.chu.appbackend.dto.ServiceHospitalierRequestDTO;
import com.chu.appbackend.dto.ServiceHospitalierResponseDTO;
import com.chu.appbackend.service.ServiceHospitalierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST exposant les opérations sur le référentiel des services hospitaliers.
 */
@RestController
@RequestMapping("/api/services-hospitaliers")
@RequiredArgsConstructor
@Tag(name = "Services hospitaliers", description = "Référentiel et disponibilité des services d'accueil")
public class ServiceHospitalierController {

    private final ServiceHospitalierService serviceHospitalierService;

    @Operation(summary = "Créer un service hospitalier")
    @PostMapping
    public ResponseEntity<ServiceHospitalierResponseDTO> createService(@Valid @RequestBody ServiceHospitalierRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceHospitalierService.createService(request));
    }

    @Operation(summary = "Récupérer un service hospitalier par son identifiant")
    @GetMapping("/{id}")
    public ResponseEntity<ServiceHospitalierResponseDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceHospitalierService.getServiceById(id));
    }

    @Operation(summary = "Lister tous les services hospitaliers")
    @GetMapping
    public ResponseEntity<List<ServiceHospitalierResponseDTO>> getAllServices() {
        return ResponseEntity.ok(serviceHospitalierService.getAllServices());
    }

    @Operation(summary = "Lister les services disposant d'une place disponible")
    @GetMapping("/disponibles")
    public ResponseEntity<List<ServiceHospitalierResponseDTO>> getServicesDisponibles() {
        return ResponseEntity.ok(serviceHospitalierService.getServicesDisponibles());
    }

    @Operation(summary = "Mettre à jour un service hospitalier")
    @PutMapping("/{id}")
    public ResponseEntity<ServiceHospitalierResponseDTO> updateService(@PathVariable Long id,
                                                                       @Valid @RequestBody ServiceHospitalierRequestDTO request) {
        return ResponseEntity.ok(serviceHospitalierService.updateService(id, request));
    }

    @Operation(summary = "Supprimer un service hospitalier")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceHospitalierService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Désactiver un service hospitalier")
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateService(@PathVariable Long id) {
        serviceHospitalierService.deactivateService(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Activer un service hospitalier")
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateService(@PathVariable Long id) {
        serviceHospitalierService.activateService(id);
        return ResponseEntity.noContent().build();
    }
}