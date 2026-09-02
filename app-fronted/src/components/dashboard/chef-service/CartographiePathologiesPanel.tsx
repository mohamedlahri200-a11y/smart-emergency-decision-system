// src/components/dashboard/chef-service/CartographiePathologiesPanel.tsx
import React from "react";
import { Paper, Typography, Stack, Box, LinearProgress } from "@mui/material";
import { PublicRounded } from "@mui/icons-material";

interface LignePathologie {
    pathologie: string;
    total: number;
    hommes: number;
    femmes: number;
}

interface Props {
    pathologies: LignePathologie[];
}

const CartographiePathologiesPanel: React.FC<Props> = ({ pathologies }) => {
    const maxTotal = Math.max(1, ...pathologies.map((p) => p.total));
    const top8 = pathologies.slice(0, 8);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <PublicRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Pathologies et suspicions cliniques les plus fréquentes</Typography>
            </Stack>

            {top8.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Aucune suspicion clinique significative détectée par l'IA pour l'instant.</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {top8.map((p) => (
                        <Box key={p.pathologie}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                <Typography variant="body2" fontWeight={600}>{p.pathologie}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {p.total} cas · {p.hommes}H / {p.femmes}F
                                </Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={(p.total / maxTotal) * 100} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default CartographiePathologiesPanel;