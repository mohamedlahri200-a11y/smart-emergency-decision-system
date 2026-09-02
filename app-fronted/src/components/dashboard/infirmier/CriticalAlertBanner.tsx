// src/components/dashboard/infirmier/CriticalAlertBanner.tsx
import React from "react";
import { Paper, Box, Typography, Stack, Chip, Avatar } from "@mui/material";
import { WarningRounded, ChevronRightRounded } from "@mui/icons-material";
import { keyframes } from "@mui/material/styles";
import type { PatientListItem } from "../../../types/infirmier.types";

interface Props {
    patients: PatientListItem[];
    onPatientClick: (patientId: number) => void;
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

/**
 * Bannière d'alerte visuelle forte, affichée uniquement quand au moins un
 * patient est classé priorité Rouge (P1 - vital) et n'a pas encore été
 * pris en charge par un médecin.
 */
const CriticalAlertBanner: React.FC<Props> = ({ patients, onPatientClick }) => {
    if (patients.length === 0) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                mb: 3,
                p: 2.5,
                borderRadius: 4,
                border: "2px solid #D32F2F",
                backgroundColor: "#FFF5F5",
                animation: `${pulse} 2.2s infinite`,
            }}
        >
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: patients.length > 0 ? 1.5 : 0 }}>
                <Avatar sx={{ bgcolor: "#D32F2F", width: 40, height: 40, animation: `${iconPulse} 1.4s ease-in-out infinite` }}>
                    <WarningRounded />
                </Avatar>
                <Box>
                    <Typography fontWeight={800} color="#B71C1C" sx={{ lineHeight: 1.2 }}>
                        {patients.length} cas critique{patients.length > 1 ? "s" : ""} — priorité Rouge (vital)
                    </Typography>
                    <Typography variant="caption" color="#8B0000">
                        Nécessite une orientation immédiate vers la salle de déchocage
                    </Typography>
                </Box>
            </Stack>

            <Stack spacing={1}>
                {patients.slice(0, 4).map((p) => (
                    <Box
                        key={p.id}
                        onClick={() => onPatientClick(p.id)}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            backgroundColor: "#fff",
                            border: "1px solid #FBD5D5",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                            "&:hover": { backgroundColor: "#FFECEC" },
                        }}
                    >
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Chip size="small" label={p.numeroDossier} sx={{ fontWeight: 700 }} />
                            <Typography variant="body2" fontWeight={700}>{p.nomComplet}</Typography>
                            <Typography variant="caption" color="text.secondary">arrivé à {p.heureArrivee}</Typography>
                        </Stack>
                        <ChevronRightRounded sx={{ color: "#D32F2F" }} />
                    </Box>
                ))}
                {patients.length > 4 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                        + {patients.length - 4} autre{patients.length - 4 > 1 ? "s" : ""} cas critique{patients.length - 4 > 1 ? "s" : ""}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
};

export default CriticalAlertBanner;