// src/pages/dashboard/DashboardIndisponiblePage.tsx
import React from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { ConstructionRounded, LogoutRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getStoredUser, roleLabels } from "../../utils/authUser";

const DashboardIndisponiblePage: React.FC = () => {
    const navigate = useNavigate();
    const user = getStoredUser();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F5F8FD", p: 2 }}>
            <Paper sx={{ p: 5, borderRadius: 4, textAlign: "center", maxWidth: 480 }}>
                <ConstructionRounded sx={{ fontSize: 56, color: "#0D47A1", mb: 2 }} />
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                    Dashboard en cours de développement
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Le tableau de bord {user ? `« ${roleLabels[user.role]} »` : "de ce rôle"} n'est pas encore
                    disponible sur la plateforme. Contactez l'administrateur si vous pensez qu'il s'agit d'une erreur.
                </Typography>
                <Stack direction="row" justifyContent="center">
                    <Button variant="contained" startIcon={<LogoutRounded />} onClick={handleLogout}>
                        Se déconnecter
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default DashboardIndisponiblePage;