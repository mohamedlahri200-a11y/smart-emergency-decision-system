// src/components/dashboard/chef-service/AnalyseExamensTable.tsx
import React from "react";
import { Paper, Typography, Stack, Box, Chip, LinearProgress } from "@mui/material";
import { ScienceRounded } from "@mui/icons-material";

interface LigneExamen {
    type: string;
    categorie: string;
    total: number;
}

interface Props {
    examens: LigneExamen[];
}

const AnalyseExamensTable: React.FC<Props> = ({ examens }) => {
    const maxTotal = Math.max(1, ...examens.map((e) => e.total));
    const top10 = examens.slice(0, 10);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, mb: 3 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <ScienceRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>Examens les plus demandés</Typography>
            </Stack>

            {top10.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Aucun examen enregistré pour l'instant.</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {top10.map((e) => (
                        <Box key={e.type}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Stack direction="row" alignItems="center" gap={1}>
                                    <Typography variant="body2" fontWeight={600}>{e.type}</Typography>
                                    <Chip size="small" label={e.categorie === "IMAGERIE" ? "Imagerie" : "Biologie"} variant="outlined" sx={{ height: 20 }} />
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>{e.total}</Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={(e.total / maxTotal) * 100}
                                sx={{ height: 6, borderRadius: 3 }}
                                color={e.categorie === "IMAGERIE" ? "primary" : "secondary"}
                            />
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default AnalyseExamensTable;