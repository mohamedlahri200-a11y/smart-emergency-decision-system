// src/layouts/dashboard/DashboardSidebar.tsx
import React from "react";
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Avatar, Divider,
} from "@mui/material";
import {
    DashboardRounded, PeopleAltRounded, MonitorHeartRounded, AssignmentRounded,
    LogoutRounded, RadioButtonCheckedRounded,
    ScienceRounded, AutoAwesomeRounded, NotificationsRounded,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { getStoredUser, type AppRole } from "../../utils/authUser";
import chuLogo from "../../assets/images/chu-logo.png";

const DRAWER_WIDTH = 260;

const infirmierMenu = [
    { label: "Tableau de bord", icon: <DashboardRounded />, path: "/dashboard/infirmier" },
    { label: "Patients", icon: <PeopleAltRounded />, path: "/dashboard/infirmier/patients" },
    { label: "Triage", icon: <MonitorHeartRounded />, path: "/dashboard/infirmier/triage" },
    { label: "Historique", icon: <AssignmentRounded />, path: "/dashboard/infirmier/historique" },
];

const medecinMenu = [
    { label: "Tableau de bord", icon: <DashboardRounded />, path: "/dashboard/medecin" },
    { label: "Patients à consulter", icon: <PeopleAltRounded />, path: "/dashboard/medecin/patients" },
    { label: "Aide IA", icon: <AutoAwesomeRounded />, path: "/dashboard/medecin/aide-ia" },
    { label: "Notifications", icon: <NotificationsRounded />, path: "/dashboard/medecin/notifications" },
    { label: "Historique", icon: <AssignmentRounded />, path: "/dashboard/medecin/historique" },
];

const radiologueMenu = [
    { label: "Tableau de bord", icon: <DashboardRounded />, path: "/dashboard/radiologue" },
    { label: "Examens à réaliser", icon: <RadioButtonCheckedRounded />, path: "/dashboard/radiologue/examens" },
    { label: "Aide IA", icon: <AutoAwesomeRounded />, path: "/dashboard/radiologue/aide-ia" },
    { label: "Historique", icon: <AssignmentRounded />, path: "/dashboard/radiologue/historique" },
];

const biologisteMenu = [
    { label: "Tableau de bord", icon: <DashboardRounded />, path: "/dashboard/biologiste" },
    { label: "Analyses à réaliser", icon: <ScienceRounded />, path: "/dashboard/biologiste/analyses" },
    { label: "Aide IA", icon: <AutoAwesomeRounded />, path: "/dashboard/biologiste/aide-ia" },
    { label: "Historique", icon: <AssignmentRounded />, path: "/dashboard/biologiste/historique" },
];

const chefServiceMenu = [
    { label: "Tableau de bord", icon: <DashboardRounded />, path: "/dashboard/chef-service" },
];

const menusByRole: Partial<Record<AppRole, typeof infirmierMenu>> = {
    INFIRMIER: infirmierMenu,
    MEDECIN: medecinMenu,
    RADIOLOGUE: radiologueMenu,
    BIOLOGISTE: biologisteMenu,
    CHEF_SERVICE: chefServiceMenu,
};

const DashboardSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getStoredUser();

    const menuItems = (user && menusByRole[user.role]) ?? infirmierMenu;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box", backgroundColor: "#0D47A1", color: "#fff", borderRight: "none" },
            }}
        >
            <Toolbar sx={{ py: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: "#fff", width: 56, height: 56 }}>
    <Box component="img" src={chuLogo} alt="Logo CHU Oujda" sx={{ width: "88%", height: "88%", objectFit: "contain" }} />
</Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>CHU Oujda</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.75 }}>Urgences — SEDS</Typography>
                    </Box>
                </Box>
            </Toolbar>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

            <List sx={{ px: 1.5, mt: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.path}
                            selected={active}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2, mb: 0.5, color: "#fff",
                                "&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.16)", fontWeight: 700 },
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.10)" },
                            }}
                        >
                            <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

            <List sx={{ px: 1.5, py: 1.5 }}>
                <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "#fff" }}>
                    <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}><LogoutRounded /></ListItemIcon>
                    <ListItemText primary="Déconnexion" />
                </ListItemButton>
            </List>
        </Drawer>
    );
};

export default DashboardSidebar;
export { DRAWER_WIDTH };