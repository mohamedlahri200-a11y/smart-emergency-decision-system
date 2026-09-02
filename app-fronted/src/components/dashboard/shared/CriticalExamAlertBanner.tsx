// src/components/dashboard/shared/CriticalExamAlertBanner.tsx
import React from "react";
import { Paper, Box, Typography, Stack, Chip, Avatar } from "@mui/material";
import { WarningRounded, ChevronRightRounded } from "@mui/icons-material";
import { keyframes } from "@mui/material/styles";
import type { ExamenAvecPriorite } from "./ExamensATraiterTable";

interface Props {
    examens: ExamenAvecPriorite[];
    onExamenClick: (examenId: number) => void;
    typeLabel: string;
}

const pulse = keyframes`
    0%   { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.45); }
    70%  { box-shadow: 0 0 0 14px rgba(211, 47, 47, 0); }
    100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
`;

const iconPulse = keyframes`
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.12); }
`;

const CriticalExamAlertBanner: React.FC<Props> = ({ examens, onExamenClick, typeLabel }) => {
    if (examens.length === 0) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 3, p: 2.5, borderRadius: 4,
                border: "2px solid #D32F2F", backgroundColor: "#FFF5F5",
                animation: `${pulse} 2.2s infinite`,
            }}
        >
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
                <Avatar sx={{ bgcolor: "#D32F2F", width: 40, height: 40, animation: `${iconPulse} 1.4s ease-in-out infinite` }}>
                    <WarningRounded />
                </Avatar>
                <Box>
                    <Typography fontWeight={800} color="#B71C1C" sx={{ lineHeight: 1.2 }}>
                        {examens.length} examen{examens.length > 1 ? "s" : ""} {typeLabel} en attente — priorité Rouge (vital)
                    </Typography>
                    <Typography variant="caption" color="#8B0000">
                        À traiter en priorité absolue, avant tout autre examen en file
                    </Typography>
                </Box>
            </Stack>

            <Stack spacing={1}>
                {examens.slice(0, 4).map((e) => (
                    <Box
                        key={e.id}
                        onClick={() => onExamenClick(e.id)}
                        sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            px: 1.5, py: 1, borderRadius: 2, backgroundColor: "#fff",
                            border: "1px solid #FBD5D5", cursor: "pointer",
                            transition: "background-color 0.15s",
                            "&:hover": { backgroundColor: "#FFECEC" },
                        }}
                    >
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Chip size="small" label={e.typeExamen} sx={{ fontWeight: 700 }} />
                            <Typography variant="body2" fontWeight={700}>{e.patientNomComplet}</Typography>
                        </Stack>
                        <ChevronRightRounded sx={{ color: "#D32F2F" }} />
                    </Box>
                ))}
                {examens.length > 4 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                        + {examens.length - 4} autre{examens.length - 4 > 1 ? "s" : ""}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

export default CriticalExamAlertBanner;