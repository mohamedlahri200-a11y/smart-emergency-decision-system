import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function LoginLeftPanel() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 40,
                    left: 50,
                    zIndex: 10,
                }}
            >
                {/* Logo CHU */}

                <Box
                    component="img"
                    src="/logo-chu.png"
                    alt="CHU Mohammed VI"
                    sx={{
                        width: 90,
                        mb: 3,
                    }}
                />

                <Typography
                    sx={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: 36,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                    }}
                >
                    SMART
                </Typography>

                <Typography
                    sx={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: 36,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                    }}
                >
                    EMERGENCY
                </Typography>

                <Typography
                    sx={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: 36,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                    }}
                >
                    DECISION
                </Typography>

                <Typography
                    sx={{
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: 36,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                        mb: 3,
                    }}
                >
                    SYSTEM
                </Typography>

                <Typography
                    sx={{
                        width: 500,
                        color: "rgba(255,255,255,0.92)",
                        fontSize: 20,
                        fontWeight: 700,
                        lineHeight: 1.6,
                    }}
                >
                    Plate-forme intelligente d'aide à la décision
                    des cas d'urgence
                </Typography>
            </Box>
        </motion.div>
    );
}