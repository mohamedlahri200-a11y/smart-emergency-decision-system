// src/components/dashboard/chef-service/ChefServicePrioriteChart.tsx
import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import type { RepartitionPriorite } from "../../../types/chefService.types";

interface Props {
    data: RepartitionPriorite[];
}

const ChefServicePrioriteChart: React.FC<Props> = ({ data }) => {
    const hasData = data.some((d) => d.total > 0);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Répartition des patients par priorité
            </Typography>
            {!hasData ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                        Aucune donnée disponible pour le moment.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7ECF3" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 10, border: "1px solid #E7ECF3" }}
                                formatter={(value) => {
                                    const n = typeof value === "number" ? value : Number(value ?? 0);
                                    return [`${n} patient${n > 1 ? "s" : ""}`, "Total"];
                                }}
                            />
                            <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                                {data.map((entry) => (
                                    <Cell key={entry.priorite} fill={entry.couleur} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
};

export default ChefServicePrioriteChart;
