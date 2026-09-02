// src/components/dashboard/infirmier/wizard/steps/Step3EvaluationGenerale.tsx
import React from "react";
import { Grid2 as Grid, Paper, Typography, RadioGroup, FormControlLabel, Radio, Alert, Box } from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { Controller, type Control, useWatch } from "react-hook-form";

// 1. Types locaux explicites
export interface Step3EvaluationGeneraleData {
    conscienceNormale: boolean | null;
    respirationNormale: boolean | null;
    circulationNormale: boolean | null;
    detresseVitale: boolean | null;
}

export interface NewPatientWizardData {
    evaluationGenerale: Step3EvaluationGeneraleData;
    [key: string]: any;
}

interface Props {
    control: Control<NewPatientWizardData>;
}

type QuestionName =
    | "evaluationGenerale.conscienceNormale"
    | "evaluationGenerale.respirationNormale"
    | "evaluationGenerale.circulationNormale"
    | "evaluationGenerale.detresseVitale";

const BoolQuestion: React.FC<{
    name: QuestionName;
    label: string;
    control: Control<NewPatientWizardData>;
}> = ({ name, label, control }) => (
    <Controller
        name={name}
        control={control}
        render={({ field }) => {
            const currentValue = field.value === true ? "oui" : field.value === false ? "non" : "";

            return (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: "100%" }}>
                    <Typography fontWeight={700} sx={{ mb: 1 }}>
                        {label}
                    </Typography>
                    <RadioGroup
                        row
                        value={currentValue}
                        onChange={(e) => field.onChange(e.target.value === "oui")}
                    >
                        <FormControlLabel value="oui" control={<Radio />} label="Oui" />
                        <FormControlLabel value="non" control={<Radio />} label="Non" />
                    </RadioGroup>
                </Paper>
            );
        }}
    />
);

const Step3EvaluationGenerale: React.FC<Props> = ({ control }) => {
    const detresseVitale = useWatch({
        control,
        name: "evaluationGenerale.detresseVitale"
    });

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <BoolQuestion name="evaluationGenerale.conscienceNormale" label="Conscience normale ?" control={control} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <BoolQuestion name="evaluationGenerale.respirationNormale" label="Respiration normale ?" control={control} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <BoolQuestion name="evaluationGenerale.circulationNormale" label="Circulation normale ?" control={control} />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <BoolQuestion name="evaluationGenerale.detresseVitale" label="Présence d'une détresse vitale ?" control={control} />
            </Grid>

            {detresseVitale === true && (
                <Grid size={{ xs: 12 }}>
                    <Alert
                        severity="error"
                        icon={<WarningAmberRounded fontSize="large" />}
                        sx={{ borderRadius: 3, alignItems: "center", fontWeight: 700 }}
                    >
                        <Box>
                            <Typography fontWeight={800}>⚠ Détresse vitale détectée</Typography>
                            <Typography variant="body2">
                                Orientation immédiate vers la salle de déchocage. Le médecin urgentiste est notifié automatiquement.
                            </Typography>
                        </Box>
                    </Alert>
                </Grid>
            )}
        </Grid>
    );
};

export default Step3EvaluationGenerale;