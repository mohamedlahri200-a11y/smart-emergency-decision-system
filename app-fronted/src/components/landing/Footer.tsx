import {
    Box,
    Container,
    Divider,
    IconButton,
    Link,
    Stack,
    Typography
} from "@mui/material";


import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import chuLogo from "../../assets/images/chu-logo.png";

export default function Footer() {

    return (

        <Box
            component="footer"
            sx={{
                bgcolor: "#0D47A1",
                color: "white",
                pt: 8,
                pb: 3,
                mt: 0
            }}
        >

            <Container maxWidth="xl">

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 5
                    }}
                >

                    {/* Logo */}

                    <Box
                        sx={{
                            maxWidth: 350
                        }}
                    >

                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            mb={2}
                        >

                            <Box
                                component="img"
                                src={chuLogo}
                                alt="CHU Mohammed VI Oujda"
                                sx={{
                                    width:70,
                                    height:70,
                                    objectFit:"contain"
                                }}
                            />

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >
                                CHU Mohammed VI
                            </Typography>

                        </Stack>

                        <Typography
                            sx={{
                                opacity: .85
                            }}
                        >
                            Smart Emergency Decision System est une plateforme
                            intelligente d'aide à la décision des cas d'urgence,
                            développée pour améliorer la qualité des soins grâce
                            à l'intelligence artificielle.
                        </Typography>

                    </Box>

                    {/* Liens */}

                    <Box>

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={2}
                        >
                            Navigation
                        </Typography>

                        <Stack spacing={1}>

                            <Link
                                href="#hero"
                                underline="hover"
                                color="inherit"
                            >
                                Accueil
                            </Link>

                            <Link
                                href="#about"
                                underline="hover"
                                color="inherit"
                            >
                                À propos
                            </Link>

                            <Link
                                href="#features"
                                underline="hover"
                                color="inherit"
                            >
                                Fonctionnalités
                            </Link>

                            <Link
                                href="#metiers"
                                underline="hover"
                                color="inherit"
                            >
                                Nos métiers
                            </Link>

                            <Link
                                href="#contact"
                                underline="hover"
                                color="inherit"
                            >
                                Contact
                            </Link>

                        </Stack>

                    </Box>

                    {/* Contact */}

                    <Box>

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={2}
                        >
                            Contact
                        </Typography>

                        <Typography>
                            CHU Mohammed VI
                        </Typography>

                        <Typography>
                            Oujda - Maroc
                        </Typography>

                        <Typography>
                            +212 XX XX XX XX XX
                        </Typography>

                        <Typography>
                            contact@chu-oujda.ma
                        </Typography>

                    </Box>

                    {/* Réseaux sociaux */}

                    <Box>

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={2}
                        >
                            Suivez-nous
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                        >

                            <IconButton
                                sx={{
                                    color: "white"
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>

                            <IconButton
                                sx={{
                                    color: "white"
                                }}
                            >
                                <LinkedInIcon />
                            </IconButton>

                            <IconButton
                                sx={{
                                    color: "white"
                                }}
                            >
                                <EmailIcon />
                            </IconButton>

                            <IconButton
                                sx={{
                                    color: "white"
                                }}
                            >
                                <LanguageIcon />
                            </IconButton>

                        </Stack>

                    </Box>

                </Box>

                <Divider
                    sx={{
                        my: 4,
                        bgcolor: "rgba(255,255,255,.20)"
                    }}
                />

                <Typography
                    align="center"
                    sx={{
                        opacity: .8
                    }}
                >
                    © {new Date().getFullYear()} CHU Mohammed VI d'Oujda —
                    Smart Emergency Decision System. Tous droits réservés.
                </Typography>

            </Container>

        </Box>

    );

}