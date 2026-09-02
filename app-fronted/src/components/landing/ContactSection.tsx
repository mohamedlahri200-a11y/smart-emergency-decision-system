import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";

export default function ContactSection() {
    return (
        <Box
            id="contact"
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
                    Contact
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
                    Pour toute question concernant la plateforme Smart Emergency
                    Decision System, contactez le CHU Mohammed VI d'Oujda.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        justifyContent: "center"
                    }}
                >

                    {/* Informations */}

                    <Card
                        sx={{
                            width: 380,
                            borderRadius: 5,
                            boxShadow: 3
                        }}
                    >
                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Coordonnées
                            </Typography>

                            <Stack spacing={3} sx={{ mt: 3 }}>

                                <Stack direction="row" spacing={2}>
                                    <LocationOnIcon color="primary" />
                                    <Typography>
                                        CHU Mohammed VI
                                        <br />
                                        Oujda, Maroc
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <PhoneIcon color="primary" />
                                    <Typography>
                                        +212 XX XX XX XX XX
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <EmailIcon color="primary" />
                                    <Typography>
                                        contact@chu-oujda.ma
                                    </Typography>
                                </Stack>

                            </Stack>

                        </CardContent>
                    </Card>

                    {/* Formulaire */}

                    <Card
                        sx={{
                            width: 550,
                            borderRadius: 5,
                            boxShadow: 3
                        }}
                    >
                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Nous contacter
                            </Typography>

                            <Stack spacing={3} sx={{ mt: 3 }}>

                                <TextField
                                    fullWidth
                                    label="Nom complet"
                                />

                                <TextField
                                    fullWidth
                                    label="Adresse e-mail"
                                />

                                <TextField
                                    fullWidth
                                    label="Sujet"
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    label="Votre message"
                                />

                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<SendIcon />}
                                    sx={{
                                        borderRadius: 10,
                                        textTransform: "none",
                                        py: 1.5
                                    }}
                                >
                                    Envoyer le message
                                </Button>

                            </Stack>

                        </CardContent>
                    </Card>

                </Box>

            </Container>
        </Box>
    );
}