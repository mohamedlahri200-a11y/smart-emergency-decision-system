import { Link as RouterLink } from "react-router-dom";

import {
    Box,
    Button,
    Container,
    Stack,
    Typography
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoginIcon from "@mui/icons-material/Login";
import AIEmergencyEmblem from "./AIEmergencyEmblem";

export default function HeroSection() {
    return (
        <Box
            id="hero"
            sx={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                background:
                    "linear-gradient(135deg,#E3F2FD 0%,#FFFFFF 50%,#F8FBFF 100%)",
                py: 8
            }}
        >
            <Container maxWidth="xl">

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6
                    }}
                >

                    {/* Partie gauche */}

                    <Box
                        sx={{
                            flex: "1 1 500px",
                            maxWidth: 650
                        }}
                    >

                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            sx={{
                                color: "#0D47A1",
                                mb: 3
                            }}
                        >
                            SMART EMERGENCY
                            <br />
                            DECISION SYSTEM
                        </Typography>

                        <Typography
                            variant="h5"
                            color="primary"
                            sx={{ mb: 3 }}
                        >
                            Plateforme intelligente d'aide à la décision des cas
                            d'urgence.
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                lineHeight: 2,
                                mb: 4
                            }}
                        >
                            Notre plateforme utilise l'Intelligence Artificielle
                            pour assister les professionnels de santé dans le
                            triage, le diagnostic, la prédiction des examens,
                            l'orientation hospitalière et la prise de décision
                            médicale tout en assurant la sécurité des données.
                        </Typography>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row"
                            }}
                            spacing={2}
                        >

                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                href="#features"
                                sx={{
                                    borderRadius: 8,
                                    px: 4,
                                    py: 1.5,
                                    textTransform: "none"
                                }}
                            >
                                Découvrir la plateforme
                            </Button>

                            <Button
                                component={RouterLink}
                                to="/login"
                                variant="outlined"
                                size="large"
                                startIcon={<LoginIcon />}
                                sx={{
                                    borderRadius: 8,
                                    px: 4,
                                    py: 1.5,
                                    textTransform: "none"
                                }}
                            >
                                Se connecter
                            </Button>

                        </Stack>

                    </Box>

                    {/* Partie droite */}

                    <Box
                        sx={{
                            flex: "1 1 420px",
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >

                        <Box
                            sx={{
                                width: 420,
                                height: 420,
                                borderRadius: "50%",
                                bgcolor: "#E3F2FD",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                boxShadow: 6
                            }}
                        >
                            <Stack
                                alignItems="center"
                                spacing={2}
                            >
                                <AIEmergencyEmblem size={150} />

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    textAlign="center"
                                >
                                    Intelligence Artificielle
                                    <br />
                                    au service des urgences
                                </Typography>

                            </Stack>

                        </Box>

                    </Box>

                </Box>

            </Container>
        </Box>
    );
}