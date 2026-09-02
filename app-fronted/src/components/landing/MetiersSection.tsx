import { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography
} from "@mui/material";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ScienceIcon from "@mui/icons-material/Science";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

interface Metier {
    title: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    features: string[];
}

const metiers: Metier[] = [
    {
        title: "Infirmier d'accueil",
        icon: <MonitorHeartIcon sx={{ fontSize: 55 }} />,
        color: "#1976d2",
        description:
            "Responsable de l'accueil, du triage et de la collecte des constantes vitales.",
        features: [
            "Création du dossier patient",
            "Triage",
            "Constantes vitales",
            "Évaluation initiale",
            "Transmission au médecin"
        ]
    },
    {
        title: "Médecin urgentiste",
        icon: <MedicalServicesIcon sx={{ fontSize: 55 }} />,
        color: "#2E7D32",
        description:
            "Prend les décisions médicales et utilise l'intelligence artificielle comme aide.",
        features: [
            "Consultation",
            "Diagnostic",
            "Prescription",
            "Décision médicale",
            "Assistance IA"
        ]
    },
    {
        title: "Biologiste médical",
        icon: <ScienceIcon sx={{ fontSize: 55 }} />,
        color: "#8E24AA",
        description:
            "Validation et interprétation des analyses biologiques.",
        features: [
            "Gestion des prélèvements",
            "Validation",
            "Interprétation",
            "Transmission",
            "Suivi des résultats"
        ]
    },
    {
        title: "Radiologue",
        icon: <LocalHospitalIcon sx={{ fontSize: 55 }} />,
        color: "#EF6C00",
        description:
            "Gestion des examens d'imagerie médicale.",
        features: [
            "Radiographie",
            "Scanner",
            "IRM",
            "Échographie",
            "Compte rendu"
        ]
    },
    {
        title: "Chef du service",
        icon: <AdminPanelSettingsIcon sx={{ fontSize: 55 }} />,
        color: "#D32F2F",
        description:
            "Pilotage du service des urgences grâce aux indicateurs et statistiques.",
        features: [
            "Statistiques",
            "Tableaux de bord",
            "Gestion des équipes",
            "Performance",
            "Décision stratégique"
        ]
    }
];

export default function MetiersSection() {
    const [selected, setSelected] = useState<Metier | null>(null);

    return (
        <Box
            id="metiers"
            sx={{
                py: 10,
                backgroundColor: "#ffffff"
            }}
        >
            <Container maxWidth="xl">

                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                >
                    Nos espaces métiers
                </Typography>

                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{
                        mb: 7,
                        maxWidth: 900,
                        mx: "auto"
                    }}
                >
                    Chaque métier dispose de son propre tableau de bord après
                    authentification. Cette section présente uniquement les
                    fonctionnalités disponibles pour chaque profil.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 3
                    }}
                >
                    {metiers.map((metier) => (
                        <Card
                            key={metier.title}
                            sx={{
                                width: 330,
                                borderRadius: 5,
                                transition: ".3s",
                                boxShadow: 2,
                                "&:hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: 8
                                }
                            }}
                        >
                            <CardContent>

                                <Stack
                                    spacing={2}
                                    alignItems="center"
                                >

                                    <Box
                                        sx={{
                                            color: metier.color
                                        }}
                                    >
                                        {metier.icon}
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        align="center"
                                    >
                                        {metier.title}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        align="center"
                                    >
                                        {metier.description}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        useFlexGap
                                        flexWrap="wrap"
                                        justifyContent="center"
                                    >
                                        {metier.features.slice(0, 3).map((item) => (
                                            <Chip
                                                key={item}
                                                label={item}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Stack>

                                    <Button
                                        variant="contained"
                                        onClick={() => setSelected(metier)}
                                        sx={{
                                            mt: 2,
                                            borderRadius: 10
                                        }}
                                    >
                                        Découvrir
                                    </Button>

                                </Stack>

                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Dialog
                    open={selected !== null}
                    onClose={() => setSelected(null)}
                    maxWidth="sm"
                    fullWidth
                >
                    {selected && (
                        <>
                            <DialogTitle>
                                {selected.title}
                            </DialogTitle>

                            <DialogContent>

                                <Typography
                                    paragraph
                                    color="text.secondary"
                                >
                                    {selected.description}
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                    sx={{ mb: 2 }}
                                >
                                    Fonctionnalités principales
                                </Typography>

                                <Stack spacing={1}>
                                    {selected.features.map((feature) => (
                                        <Chip
                                            key={feature}
                                            label={feature}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Stack>

                            </DialogContent>

                            <DialogActions>

                                <Button
                                    onClick={() => setSelected(null)}
                                    variant="contained"
                                >
                                    Fermer
                                </Button>

                            </DialogActions>
                        </>
                    )}
                </Dialog>

            </Container>
        </Box>
    );
}