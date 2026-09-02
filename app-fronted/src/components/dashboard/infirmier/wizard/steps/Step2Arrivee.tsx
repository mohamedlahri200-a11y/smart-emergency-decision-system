// src/components/dashboard/infirmier/wizard/steps/Step2Arrivee.tsx
import React from "react";
import { Grid2 as Grid, TextField, MenuItem, FormControlLabel, Checkbox, Typography, Collapse } from "@mui/material";
import { Controller, type Control, type FieldErrors, useWatch } from "react-hook-form";

// 1. Structure typée pour la section Arrivée
export interface MiseEnConditionDetails {
    oxygenotherapie: boolean;
    perfusion: boolean;
    immobilisation: boolean;
    ventilation: boolean;
    autre?: string;
}

export interface Step2ArriveeData {
    modeArrivee: string;
    accompagnementPro: string;
    miseEnCondition: boolean;
    miseEnConditionDetails: MiseEnConditionDetails;
    motifConsultation: string;
    descriptionEtat: string;
}

// Interface globale du formulaire (supporte d'autres étapes si nécessaire)
export interface NewPatientWizardData {
    arrivee: Step2ArriveeData;
    [key: string]: any;
}

interface Props {
    control: Control<NewPatientWizardData>;
    errors?: FieldErrors<Step2ArriveeData>;
}

const Step2Arrivee: React.FC<Props> = ({ control, errors }) => {
    const miseEnCondition = useWatch({
        control,
        name: "arrivee.miseEnCondition"
    });

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="arrivee.modeArrivee"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            label="Mode d'arrivée *"
                            error={!!errors?.modeArrivee}
                            helperText={errors?.modeArrivee?.message}
                        >
                            <MenuItem value="AMBULANCE">Ambulance</MenuItem>
                            <MenuItem value="MARCHE">Marche</MenuItem>
                            <MenuItem value="REFERE">Référé</MenuItem>
                            <MenuItem value="SAMU">Régulé par le SAMU</MenuItem>
                            <MenuItem value="AUTRE">Autre</MenuItem>
                        </TextField>
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                    name="arrivee.accompagnementPro"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            fullWidth
                            label="Accompagné par un professionnel de santé *"
                            error={!!errors?.accompagnementPro}
                            helperText={errors?.accompagnementPro?.message}
                        >
                            <MenuItem value="NON">Non</MenuItem>
                            <MenuItem value="MEDECIN">Médecin</MenuItem>
                            <MenuItem value="INFIRMIER">Infirmier</MenuItem>
                            <MenuItem value="AUTRE">Autre</MenuItem>
                        </TextField>
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Controller
                    name="arrivee.miseEnCondition"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Boolean(field.value)}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                />
                            }
                            label="Une mise en condition a-t-elle déjà été réalisée ?"
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Collapse in={Boolean(miseEnCondition)}>
                    <Grid container spacing={2} sx={{ pl: { sm: 2 }, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ width: "100%", ml: 2, mb: 1, color: "text.secondary" }}>
                            Détails de la mise en condition
                        </Typography>
                        {(
                            [
                                ["oxygenotherapie", "Oxygénothérapie"],
                                ["perfusion", "Perfusion"],
                                ["immobilisation", "Immobilisation"],
                                ["ventilation", "Ventilation"],
                            ] as const
                        ).map(([key, label]) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={key}>
                                <Controller
                                    name={`arrivee.miseEnConditionDetails.${key}`}
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={Boolean(field.value)}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            }
                                            label={label}
                                        />
                                    )}
                                />
                            </Grid>
                        ))}
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="arrivee.miseEnConditionDetails.autre"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Autre (préciser)"
                                        value={field.value ?? ""}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Collapse>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Controller
                    name="arrivee.motifConsultation"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Motif principal de consultation *"
                            error={!!errors?.motifConsultation}
                            helperText={errors?.motifConsultation?.message}
                        />
                    )}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Controller
                    name="arrivee.descriptionEtat"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            multiline
                            minRows={3}
                            label="Description de l'état du patient et des symptômes rapportés *"
                            error={!!errors?.descriptionEtat}
                            helperText={errors?.descriptionEtat?.message}
                        />
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default Step2Arrivee;