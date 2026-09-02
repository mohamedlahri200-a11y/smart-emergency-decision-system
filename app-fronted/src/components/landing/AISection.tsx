import {
    Avatar,
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const workflow = [
    {
        title: "Patient",
        icon: <PersonIcon />,
        color: "#1976D2"
    },
    {
        title: "Infirmier",
        icon: <MonitorHeartIcon />,
        color: "#26A69A"
    },
    {
        title: "Intelligence Artificielle",
        icon: <PsychologyIcon />,
        color: "#8E24AA"
    },
    {
        title: "Médecin",
        icon: <MedicalServicesIcon />,
        color: "#2E7D32"
    },
    {
        title: "Laboratoire",
        icon: <ScienceIcon />,
        color: "#EF6C00"
    },
    {
        title: "Radiologie",
        icon: <LocalHospitalIcon />,
        color: "#1565C0"
    },
    {
        title: "Résultats",
        icon: <CheckCircleIcon />,
        color: "#43A047"
    },
    {
        title: "Nouvelle analyse IA",
        icon: <PsychologyIcon />,
        color: "#8E24AA"
    },
    {
        title: "Décision finale",
        icon: <MedicalServicesIcon />,
        color: "#D32F2F"
    }
];

export default function AISection() {

    return (

        <Box
            id="ai"
            sx={{
                py: 10,
                background:
                    "linear-gradient(180deg,#F7FAFC 0%,#EEF6FF 100%)"
            }}
        >

            <Container maxWidth="lg">

                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                >
                    Intelligence Artificielle
                </Typography>

                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{
                        mb: 8,
                        maxWidth: 850,
                        mx: "auto"
                    }}
                >
                    Notre plateforme assiste les professionnels de santé
                    tout au long du parcours du patient afin d'améliorer
                    la qualité des décisions médicales.
                </Typography>

                <Stack
                    spacing={2}
                    alignItems="center"
                >

                    {workflow.map((step, index) => (

                        <Box
                            key={index}
                            sx={{
                                width: "100%",
                                maxWidth: 500
                            }}
                        >

                            <Card
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: 2,
                                    transition: ".3s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6
                                    }
                                }}
                            >

                                <CardContent>

                                    <Stack
                                        direction="row"
                                        spacing={3}
                                        alignItems="center"
                                    >

                                        <Avatar
                                            sx={{
                                                bgcolor: step.color,
                                                width: 60,
                                                height: 60
                                            }}
                                        >
                                            {step.icon}
                                        </Avatar>

                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                        >
                                            {step.title}
                                        </Typography>

                                    </Stack>

                                </CardContent>

                            </Card>

                            {
                                index !== workflow.length - 1 && (

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            py: 1
                                        }}
                                    >

                                        <ArrowDownwardIcon
                                            color="primary"
                                            fontSize="large"
                                        />

                                    </Box>

                                )
                            }

                        </Box>

                    ))}

                </Stack>

            </Container>

        </Box>

    );

}