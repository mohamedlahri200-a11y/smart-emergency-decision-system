// src/layouts/dashboard/DashboardLayout.tsx
import React from "react";
import { Box, Toolbar } from "@mui/material";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

interface Props {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ title, subtitle, children }) => {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F8FD" }}>
            <DashboardSidebar />
            <DashboardHeader title={title} subtitle={subtitle} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default DashboardLayout;