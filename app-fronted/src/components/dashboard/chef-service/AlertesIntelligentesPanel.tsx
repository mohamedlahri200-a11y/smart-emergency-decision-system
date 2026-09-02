




// src/components/dashboard/chef-service/AlertesIntelligentesPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Alert, Box } from "@mui/material";
import { NotificationsActiveRounded } from "@mui/icons-material";

interface AlerteIntelligente {
    niveau: "critique" | "avertissement";
    message: string;
}

interface Props {
    alertes: AlerteIntelligente[];
}

const AlertesIntelligentesPanel: React.FC<Props> = ({ alertes }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <NotificationsActiveRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Alertes intelligentes</Typography>
            </Stack>

            {alertes.length === 0 ? (
                <Box sx={{ py: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        Aucune alerte active — l'activité du service est dans les seuils normaux.
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1.25}>
                    {alertes.map((a, i) => (
                        <Alert key={i} severity={a.niveau === "critique" ? "error" : "warning"} sx={{ borderRadius: 2 }}>
                            {a.message}
                        </Alert>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default AlertesIntelligentesPanel;