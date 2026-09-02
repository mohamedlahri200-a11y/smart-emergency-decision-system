// src/components/dashboard/chef-service/RecommandationsIAPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, Chip } from "@mui/material";
import { TipsAndUpdatesRounded, ArrowForwardRounded } from "@mui/icons-material";

interface Props {
    recommandations: string[];
}

const RecommandationsIAPanel: React.FC<Props> = ({ recommandations }) => {
    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <TipsAndUpdatesRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Recommandations de l'IA</Typography>
            </Stack>

            {recommandations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    Aucune recommandation particulière — l'activité actuelle ne nécessite pas d'action immédiate.
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {recommandations.map((r, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: "flex", alignItems: "center", gap: 1.5,
                                p: 1.5, borderRadius: 2, backgroundColor: "#FFFBEA", border: "1px solid #FDECC8",
                            }}
                        >
                            <Chip
                                size="small"
                                icon={<ArrowForwardRounded sx={{ fontSize: "14px !important" }} />}
                                label="Suggestion"
                                sx={{ backgroundColor: "#B7950B", color: "#fff", fontWeight: 700 }}
                            />
                            <Typography variant="body2">{r}</Typography>
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default RecommandationsIAPanel;