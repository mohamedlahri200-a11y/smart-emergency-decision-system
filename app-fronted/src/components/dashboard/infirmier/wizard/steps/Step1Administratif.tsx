// src/components/dashboard/infirmier/wizard/steps/Step1Administratif.tsx
import React from "react";
import { Grid2 as Grid, TextField, MenuItem, Typography, Alert } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

// 1. Définition explicite de la structure de la section administrative
export interface Step1AdministratifData {
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: string;
    ip: string;
    telephone: string;
    origine: string;
    personneAContacter: string;
    telephoneContact: string;
    couvertureMedicale: string;
}

// Interface globale du formulaire
export interface NewPatientWizardData {
    administratif: Step1AdministratifData;
    [key: string]: any;
}

interface Props {
    control: Control<NewPatientWizardData>;
    errors?: FieldErrors<Step1AdministratifData>;
    dateNaissance: string;
}

// Fonction utilitaire de calcul d'âge intégrée
const calculerAge = (dateNaissance: string): number | null => {
    if (!dateNaissance) return null;
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : null;
};

const Step1Administratif: React.FC<Props> = ({ control, errors, dateNaissance }) => {
    const age = dateNaissance ? calculerAge(dateNaissance) : null;

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    Numéro de dossier généré automatiquement à l'enregistrement (ex : URG-2026-000125)
                </Alert>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.nom"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Nom *"
                            error={!!errors?.nom}
                            helperText={errors?.nom?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.prenom"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Prénom *"
                            error={!!errors?.prenom}
                            helperText={errors?.prenom?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                    name="administratif.dateNaissance"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            type="date"
                            label="Date de naissance *"
                            slotProps={{ inputLabel: { shrink: true } }}
                            error={!!errors?.dateNaissance}
                            helperText={errors?.dateNaissance?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
                <TextField fullWidth label="Âge" value={age ?? ""} disabled />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
                <Controller
                    name="administratif.sexe"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            label="Sexe *"
                            error={!!errors?.sexe}
                            helperText={errors?.sexe?.message}
                        >
                            <MenuItem value="HOMME">Homme</MenuItem>
                            <MenuItem value="FEMME">Femme</MenuItem>
                        </TextField>
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
                <Controller
                    name="administratif.ip"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="IP (Identifiant Patient) *"
                            error={!!errors?.ip}
                            helperText={errors?.ip?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.telephone"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Téléphone *"
                            error={!!errors?.telephone}
                            helperText={errors?.telephone?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.origine"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Origine du patient *"
                            error={!!errors?.origine}
                            helperText={errors?.origine?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Personne à contacter en cas d'urgence
                </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.personneAContacter"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Nom de la personne *"
                            error={!!errors?.personneAContacter}
                            helperText={errors?.personneAContacter?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.telephoneContact"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Téléphone de cette personne *"
                            error={!!errors?.telephoneContact}
                            helperText={errors?.telephoneContact?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="administratif.couvertureMedicale"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            label="Couverture médicale *"
                            error={!!errors?.couvertureMedicale}
                            helperText={errors?.couvertureMedicale?.message}
                        >
                            <MenuItem value="CNOPS">CNOPS</MenuItem>
                            <MenuItem value="CNSS">CNSS</MenuItem>
                            <MenuItem value="AMO">AMO</MenuItem>
                            <MenuItem value="AUTRE">Autre</MenuItem>
                        </TextField>
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default Step1Administratif;