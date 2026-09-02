// src/components/dashboard/shared/StatCardsGrid.tsx
import React from "react";
import { Paper, Box, Typography, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { TrendingUpRounded, TrendingDownRounded } from "@mui/icons-material";

export interface StatCardData {
    label: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
    /** Variation optionnelle affichée sous la valeur (ex: "+3 depuis hier"). */
    tendance?: { valeur: number; libelle: string };
    /** Met la carte en évidence (ex: cas critiques > 0). */
    accentue?: boolean;
}

interface Props {
    cards: StatCardData[];
}

/**
 * Grille de cartes statistiques au design cohérent, réutilisée par tous
 * les dashboards (médecin, radiologue, biologiste, infirmier, chef de
 * service) : liseré coloré supérieur, icône dans un badge arrondi,
 * valeur mise en avant, effet de survol léger, tendance optionnelle.
 */
const StatCardsGrid: React.FC<Props> = ({ cards }) => {
    return (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {cards.map((c) => (
                <Grid key={c.label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <Paper
                        onClick={c.onClick}
                        elevation={0}
                        sx={{
                            position: "relative",
                            p: 2.5,
                            pt: 3,
                            borderRadius: 4,
                            overflow: "hidden",
                            border: "1px solid #EDF1F7",
                            cursor: c.onClick ? "pointer" : "default",
                            transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                            boxShadow: c.accentue ? `0 0 0 1px ${c.color}33, 0 8px 20px -8px ${c.color}55` : "0 1px 2px rgba(16,24,40,0.04)",
                            "&:hover": c.onClick
                                ? { transform: "translateY(-3px)", boxShadow: `0 12px 24px -10px ${c.color}66`, borderColor: `${c.color}55` }
                                : undefined,
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0, left: 0, right: 0,
                                height: 4,
                                background: `linear-gradient(90deg, ${c.color}, ${c.color}99)`,
                            },
                        }}
                    >
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
                            <Box>
                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    sx={{ color: "#1A2332", lineHeight: 1.1, letterSpacing: "-0.02em" }}
                                >
                                    {c.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                                    {c.label}
                                </Typography>
                                {c.tendance && (
                                    <Stack direction="row" alignItems="center" gap={0.4} sx={{ mt: 0.75 }}>
                                        {c.tendance.valeur >= 0 ? (
                                            <TrendingUpRounded sx={{ fontSize: 15, color: "#2E7D32" }} />
                                        ) : (
                                            <TrendingDownRounded sx={{ fontSize: 15, color: "#D32F2F" }} />
                                        )}
                                        <Typography variant="caption" sx={{ color: c.tendance.valeur >= 0 ? "#2E7D32" : "#D32F2F", fontWeight: 700 }}>
                                            {c.tendance.libelle}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>
                            <Box
                                sx={{
                                    width: 46, height: 46, borderRadius: "14px", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: `linear-gradient(135deg, ${c.color}22, ${c.color}12)`,
                                    color: c.color,
                                }}
                            >
                                {c.icon}
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default StatCardsGrid;