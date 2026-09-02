import {
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";

import PsychologyIcon from "@mui/icons-material/Psychology";
import BiotechIcon from "@mui/icons-material/Biotech";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TimelineIcon from "@mui/icons-material/Timeline";
import SecurityIcon from "@mui/icons-material/Security";
import GroupsIcon from "@mui/icons-material/Groups";

const features = [
    {
        icon: <PsychologyIcon sx={{ fontSize: 45, color: "#1976d2" }} />,
        title: "Triage intelligent",
        description:
            "Classification automatique des patients selon leur niveau d'urgence."
    },
    {
        icon: <ScienceIcon sx={{ fontSize: 45, color: "#00ACC1" }} />,
        title: "Analyses biologiques",
        description:
            "Prédiction des examens biologiques adaptés à chaque patient."
    },
    {
        icon: <MedicalServicesIcon sx={{ fontSize: 45, color: "#43A047" }} />,
        title: "Examens radiologiques",
        description:
            "Suggestion des examens d'imagerie médicale nécessaires."
    },
    {
        icon: <LocalHospitalIcon sx={{ fontSize: 45, color: "#1565C0" }} />,
        title: "Orientation hospitalière",
        description:
            "Orientation intelligente vers le service médical approprié."
    },
    {
        icon: <MedicationIcon sx={{ fontSize: 45, color: "#8E24AA" }} />,
        title: "Aide thérapeutique",
        description:
            "Recommandations médicales pour accompagner le médecin."
    },
    {
        icon: <TimelineIcon sx={{ fontSize: 45, color: "#EF6C00" }} />,
        title: "Durée d'hospitalisation",
        description:
            "Estimation de la durée probable du séjour hospitalier."
    },
    {
        icon: <NotificationsActiveIcon sx={{ fontSize: 45, color: "#D81B60" }} />,
        title: "Notifications",
        description:
            "Alertes en temps réel entre les différents services."
    },
    {
        icon: <GroupsIcon sx={{ fontSize: 45, color: "#00897B" }} />,
        title: "Collaboration",
        description:
            "Communication fluide entre infirmiers, médecins, biologistes et radiologues."
    },
    {
        icon: <SecurityIcon sx={{ fontSize: 45, color: "#3949AB" }} />,
        title: "Traçabilité",
        description:
            "Historique complet des décisions médicales et des actions réalisées."
    },
    {
        icon: <BiotechIcon sx={{ fontSize: 45, color: "#5E35B1" }} />,
        title: "Intelligence Artificielle",
        description:
            "Algorithmes prédictifs pour améliorer la prise de décision médicale."
    }
];

export default function FeaturesSection() {
    return (
        <Box
            id="features"
            sx={{
                py: 10,
                background: "#F8FBFF"
            }}
        >
            <Container maxWidth="xl">

                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                >
                    Fonctionnalités principales
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
                    Une plateforme intelligente conçue pour améliorer la qualité
                    des soins, accélérer les décisions médicales et renforcer la
                    collaboration entre les professionnels du CHU Mohammed VI.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 3
                    }}
                >
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            sx={{
                                width: 320,
                                borderRadius: 4,
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
                                    {feature.icon}

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        align="center"
                                    >
                                        {feature.title}
                                    </Typography>

                                    <Typography
                                        align="center"
                                        color="text.secondary"
                                    >
                                        {feature.description}
                                    </Typography>

                                </Stack>

                            </CardContent>
                        </Card>
                    ))}
                </Box>

            </Container>
        </Box>
    );
}