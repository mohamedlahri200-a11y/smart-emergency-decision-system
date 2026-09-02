import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";

const LoginRightPanel = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
        >
            <Box
                sx={{
                    position: "absolute",
                    bottom: 45,
                    right: 50,
                    maxWidth: 420,
                    textAlign: "right",
                }}
            >
                <FavoriteRoundedIcon
                    sx={{
                        color: "#ffffff",
                        fontSize: 42,
                        mb: 2,
                    }}
                />

                <Typography
                    sx={{
                        color: "#ffffff",
                        fontSize: 26,
                        fontWeight: 700,
                        lineHeight: 1.5,
                    }}
                >
                    Une décision rapide,
                    <br />
                    précise et intelligente
                    <br />
                    peut sauver une vie.
                </Typography>

                <Typography
                    sx={{
                        mt: 2,
                        color: "rgba(255,255,255,0.80)",
                        fontSize: 16,
                    }}
                >
                    Système d'aide à la décision clinique
                    <br />
                    CHU Mohammed VI – Oujda
                </Typography>
            </Box>
        </motion.div>
    );
};

export default LoginRightPanel;