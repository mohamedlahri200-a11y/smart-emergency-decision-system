import {
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import SecurityIcon from "@mui/icons-material/Security";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import GroupsIcon from "@mui/icons-material/Groups";

const items = [
    {
        title: "Intelligence Artificielle",
        description:
            "Des modèles d'IA assistent les professionnels de santé dans le triage, la prédiction des examens et la prise de décision médicale.",
        icon: <SmartToyIcon sx={{ fontSize: 50 }} />,
        color: "#1565C0"
    },
    {
        title: "Sécurité des données",
        description:
            "Les données médicales sont protégées grâce à des mécanismes d'authentification, d'autorisation et de traçabilité.",
        icon: <SecurityIcon sx={{ fontSize: 50 }} />,
        color: "#2E7D32"
    },
    {
        title: "Collaboration hospitalière",
        description:
            "Les différents services du CHU collaborent en temps réel afin d'améliorer la qualité et la rapidité de la prise en charge.",
        icon: <GroupsIcon sx={{ fontSize: 50 }} />,
        color: "#8E24AA"
    },
    {
        title: "CHU Mohammed VI d'Oujda",
        description:
            "Une plateforme moderne dédiée au service des urgences pour accompagner les équipes médicales dans leur pratique quotidienne.",
        icon: <LocalHospitalIcon sx={{ fontSize: 50 }} />,
        color: "#EF6C00"
    }
];

export default function AboutSection() {
    return (
        <Box
            id="about"
            sx={{
                py: 10,
                bgcolor: "#F8FBFF"
            }}
        >
            <Container maxWidth="xl">

                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                >
                    À propos de la plateforme
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
                    Smart Emergency Decision System est une plateforme
                    intelligente conçue pour assister les professionnels de santé
                    du CHU Mohammed VI d'Oujda dans la gestion des cas
                    d'urgence. Grâce à l'intelligence artificielle, elle facilite
                    le triage, améliore l'orientation des patients et optimise
                    la collaboration entre les différents services hospitaliers.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 3
                    }}
                >
                    {items.map((item) => (
                        <Card
                            key={item.title}
                            sx={{
                                width: 280,
                                borderRadius: 4,
                                boxShadow: 2,
                                transition: ".3s",
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
                                    textAlign="center"
                                >
                                    <Box sx={{ color: item.color }}>
                                        {item.icon}
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        {item.description}
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