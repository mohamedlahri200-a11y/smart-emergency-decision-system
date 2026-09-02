import { Box, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

import { motion } from "framer-motion";

import chuLogo from "../../assets/images/chu-logo.png";

const LoginHeader = () => {
    return (
        <Box
            sx={{
                width: "100%",
                position: "relative",
                mb: 5,
                zIndex: 2,
            }}
        >
            {/* Logo CHU */}

            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Box
                    component="img"
                    src={chuLogo}
                    alt="CHU Mohammed VI"
                    sx={{
                        position: "absolute",
                        left: 40,
                        top: 20,
                        width: 170,
                        userSelect: "none",
                    }}
                />
            </motion.div>

            {/* Titre */}

            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
            >
                <Box
                    sx={{
                        textAlign: "center",
                        pt: 6,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "2.6rem",
                                md: "4.4rem",
                            },
                            fontWeight: 900,
                            color: "#0D47A1",
                            lineHeight: 1.05,
                            letterSpacing: 1,
                        }}
                    >
                        SMART EMERGENCY
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: {
                                xs: "2.6rem",
                                md: "4.4rem",
                            },
                            fontWeight: 900,
                            color: "#0D47A1",
                            lineHeight: 1.05,
                            letterSpacing: 1,
                            mb: 2,
                        }}
                    >
                        DECISION SYSTEM
                    </Typography>

                    {/* ECG */}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 220,
                                height: 2,
                                bgcolor: "#90CAF9",
                            }}
                        />

                        <FavoriteIcon
                            sx={{
                                color: "#1976D2",
                                fontSize: 34,
                            }}
                        />

                        <Box
                            sx={{
                                width: 220,
                                height: 2,
                                bgcolor: "#90CAF9",
                            }}
                        />
                    </Box>

                    {/* Sous titre */}

                    <Typography
                        sx={{
                            maxWidth: 950,
                            mx: "auto",
                            px: 2,
                            fontWeight: 800,
                            fontSize: {
                                xs: "1.3rem",
                                md: "2rem",
                            },
                            color: "#55637A",
                            lineHeight: 1.4,
                            textTransform: "uppercase",
                        }}
                    >
                        PLATE-FORME INTELLIGENTE D'AIDE À LA
                        <br />
                        DÉCISION DES CAS D'URGENCE
                    </Typography>
                </Box>
            </motion.div>
        </Box>
    );
};

export default LoginHeader;