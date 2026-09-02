// src/components/dashboard/infirmier/wizard/steps/Step4SignesVitaux.tsx

import React from "react";
import {
    Grid2 as Grid,
    Paper,
    TextField,
    Typography,
    Alert,
    Stack,
} from "@mui/material";
import {
    Controller,
    type Control,
    useWatch,
} from "react-hook-form";

export interface Step4SignesVitauxData {
    poids?: number | null;
    taille?: number | null;
    frequenceRespiratoire?: number | null;
    saturationO2?: number | null;
    frequenceCardiaque?: number | null;
    taSystolique?: number | null;
    taDiastolique?: number | null;
    temperature?: number | null;
    dextro?: number | null;
    eva?: number | null;
    glasgow?: number | null;
    ecg?: string;
}

export interface NewPatientWizardData {
    signesVitaux: Step4SignesVitauxData;
    [key: string]: any;
}

export interface AlerteTriage {
    champ: string;
    message: string;
}

interface Props {
    control: Control<NewPatientWizardData>;
}

export const calculerIMC = (
    poids?: number | null,
    taille?: number | null
): string | null => {
    if (poids == null || taille == null || taille <= 0) {
        return null;
    }
    const tailleMetres = taille / 100;
    const imc = poids / (tailleMetres * tailleMetres);
    return imc.toFixed(1);
};

export const detecterAlertes = (
    vitaux?: Step4SignesVitauxData
): AlerteTriage[] => {
    if (!vitaux) return [];
    const alertes: AlerteTriage[] = [];

    if (vitaux.saturationO2 != null && vitaux.saturationO2 < 92) {
        alertes.push({ champ: "saturationO2", message: "SpO₂ basse (< 92 %) — risque d'hypoxémie." });
    }
    if (vitaux.frequenceCardiaque != null) {
        if (vitaux.frequenceCardiaque > 120) {
            alertes.push({ champ: "frequenceCardiaque", message: "Tachycardie importante (> 120 bpm)." });
        } else if (vitaux.frequenceCardiaque < 50) {
            alertes.push({ champ: "frequenceCardiaque", message: "Bradycardie importante (< 50 bpm)." });
        }
    }
    if (vitaux.taSystolique != null && vitaux.taSystolique > 180) {
        alertes.push({ champ: "taSystolique", message: "Tension artérielle systolique très élevée (> 180 mmHg)." });
    }
    if (vitaux.temperature != null) {
        if (vitaux.temperature >= 38.5) {
            alertes.push({ champ: "temperature", message: "Fièvre élevée (≥ 38.5 °C)." });
        } else if (vitaux.temperature < 35) {
            alertes.push({ champ: "temperature", message: "Hypothermie (< 35 °C)." });
        }
    }
    if (vitaux.glasgow != null && vitaux.glasgow < 13) {
        alertes.push({ champ: "glasgow", message: "Score de Glasgow altéré (< 13/15)." });
    }

    return alertes;
};

const renderVitalField = (
    name: keyof Step4SignesVitauxData,
    label: string,
    unite: string,
    control: Control<NewPatientWizardData>
) => (
    <Controller
        name={`signesVitaux.${name}` as const}
        control={control}
        render={({ field, fieldState }) => (
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 3,
                    height: "100%",
                    borderColor: fieldState.error ? "error.main" : undefined,
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>

                <TextField
                    {...field}
                    fullWidth
                    variant="standard"
                    type={name === "ecg" ? "text" : "number"}
                    value={field.value ?? ""}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message ?? " "}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                            field.onChange(null);
                            return;
                        }
                        if (name === "ecg") {
                            field.onChange(value);
                        } else {
                            field.onChange(Number(value));
                        }
                    }}
                    slotProps={{
                        input: { endAdornment: unite },
                    }}
                />
            </Paper>
        )}
    />
);

const Step4SignesVitaux: React.FC<Props> = ({ control }) => {
    const vitaux = useWatch({ control, name: "signesVitaux" }) ?? {};
    const imc = calculerIMC(vitaux.poids, vitaux.taille);
    const alertes = detecterAlertes(vitaux);

    return (
        <Grid container spacing={2.5}>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("poids", "Poids", "kg", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("taille", "Taille", "cm", control)}</Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, backgroundColor: "#F5F8FD", height: "100%" }}>
                    <Typography variant="caption" color="text.secondary">IMC (calculé)</Typography>
                    <Typography variant="h6" fontWeight={700}>{imc ?? "—"}</Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("frequenceRespiratoire", "Fréquence respiratoire", "cyc/min", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("saturationO2", "SpO₂", "%", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("frequenceCardiaque", "Fréquence cardiaque", "bpm", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("taSystolique", "TA systolique", "mmHg", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("taDiastolique", "TA diastolique", "mmHg", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("temperature", "Température", "°C", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("dextro", "Dextro", "g/L", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("eva", "EVA", "/10", control)}</Grid>
            <Grid size={{ xs: 6, sm: 3 }}>{renderVitalField("glasgow", "Glasgow", "/15", control)}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>{renderVitalField("ecg", "ECG (observations)", "", control)}</Grid>

            {alertes.length > 0 && (
                <Grid size={{ xs: 12 }}>
                    <Stack spacing={1}>
                        {alertes.map((alerte) => (
                            <Alert key={`${alerte.champ}-${alerte.message}`} severity="warning" sx={{ borderRadius: 3 }}>
                                {alerte.message}
                            </Alert>
                        ))}
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
};

export default Step4SignesVitaux;