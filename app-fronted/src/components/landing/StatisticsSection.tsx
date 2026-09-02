import {
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PsychologyIcon from "@mui/icons-material/Psychology";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const statistics = [
    {
        value: "1200+",
        label: "Patients pris en charge",
        icon: <PeopleAltIcon sx={{ fontSize: 50 }} />,
        color: "#1976D2"
    },
    {
        value: "98 %",
        label: "Précision de l'IA",
        icon: <PsychologyIcon sx={{ fontSize: 50 }} />,
        color: "#8E24AA"
    },
    {
        value: "5",
        label: "Espaces métiers",
        icon: <DashboardIcon sx={{ fontSize: 50 }} />,
        color: "#26A69A"
    },
    {
        value: "24 / 7",
        label: "Disponibilité",
        icon: <AccessTimeIcon sx={{ fontSize: 50 }} />,
        color: "#EF6C00"
    },
    {
        value: "100 %",
        label: "Traçabilité",
        icon: <VerifiedUserIcon sx={{ fontSize: 50 }} />,
        color: "#43A047"
    }
];

export default function StatisticsSection() {

    return (

        <Box
            id="statistics"
            sx={{
                py: 10,
                background: "#ffffff"
            }}
        >

            <Container maxWidth="xl">

                <Typography
                    variant="h3"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                >
                    Quelques chiffres
                </Typography>

                <Typography
                    align="center"
                    color="text.secondary"
                    sx={{
                        mb: 7,
                        maxWidth: 850,
                        mx: "auto"
                    }}
                >
                    Des indicateurs illustrant les performances de la plateforme
                    intelligente d'aide à la décision des urgences.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 3
                    }}
                >

                    {statistics.map((item) => (

                        <Card
                            key={item.label}
                            sx={{
                                width: 220,
                                borderRadius: 5,
                                textAlign: "center",
                                transition: ".35s",
                                boxShadow: 2,
                                "&:hover": {
                                    transform: "translateY(-10px)",
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
                                            color: item.color
                                        }}
                                    >
                                        {item.icon}
                                    </Box>

                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        color={item.color}
                                    >
                                        {item.value}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        {item.label}
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