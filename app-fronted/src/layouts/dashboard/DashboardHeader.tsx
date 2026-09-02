// src/layouts/dashboard/DashboardHeader.tsx
import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Popover,
    List,
    ListItemButton,
} from "@mui/material";
import {
    NotificationsRounded,
    LogoutRounded,
    PersonRounded,
    ErrorRounded,
    WarningAmberRounded,
    InfoRounded,
    NotificationsOffRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DRAWER_WIDTH } from "./DashboardSidebar";
import { useDashboardAlerts } from "../../hooks/useDashboardAlerts";
import { getStoredUser, roleLabels } from "../../utils/authUser";

interface Props {
    title: string;
    subtitle?: string;
}

const severityIcon = {
    critical: <ErrorRounded sx={{ color: "#D32F2F" }} fontSize="small" />,
    warning: <WarningAmberRounded sx={{ color: "#F2A93B" }} fontSize="small" />,
    info: <InfoRounded sx={{ color: "#0D47A1" }} fontSize="small" />,
};

const DashboardHeader: React.FC<Props> = ({ title, subtitle }) => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const { alerts } = useDashboardAlerts();

    const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
    const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                ml: `${DRAWER_WIDTH}px`,
                backgroundColor: "#fff",
                color: "#102A43",
                borderBottom: "1px solid #E3E9F2",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    {/* Notifications */}
                    <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                        <Badge badgeContent={alerts.length} color="error">
                            <NotificationsRounded />
                        </Badge>
                    </IconButton>

                    <Popover
                        open={!!notifAnchor}
                        anchorEl={notifAnchor}
                        onClose={() => setNotifAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <Box sx={{ width: 360, maxHeight: 420, overflowY: "auto" }}>
                            <Box sx={{ p: 2, borderBottom: "1px solid #E3E9F2" }}>
                                <Typography fontWeight={800}>Notifications</Typography>
                            </Box>
                            {alerts.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: "center" }}>
                                    <NotificationsOffRounded sx={{ color: "#B0BEC5", mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Aucune notification pour le moment.
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {alerts.map((a) => (
                                        <ListItemButton
                                            key={a.id}
                                            onClick={() => {
                                                setNotifAnchor(null);
                                                navigate(a.path);
                                            }}
                                            sx={{ borderBottom: "1px solid #F1F4F9" }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                {severityIcon[a.severity]}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={a.label}
                                                slotProps={{
                                                    primary: { variant: "body2", fontWeight: 600 },
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Popover>

                    {/* Profil */}
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => setProfileAnchor(e.currentTarget)}
                    >
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "#0D47A1" }}>
                            {(user?.prenom?.[0] || "I").toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} lineHeight={1.1}>
                                {user?.prenom ? `${user.prenom} ${user.nom}` : "Infirmier(ère)"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user ? roleLabels[user.role] : "Utilisateur"}
                            </Typography>
                        </Box>
                    </Box>

                    <Menu
                        anchorEl={profileAnchor}
                        open={!!profileAnchor}
                        onClose={() => setProfileAnchor(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <MenuItem disabled>
                            <ListItemIcon>
                                <PersonRounded fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={user?.prenom ? `${user.prenom} ${user.nom}` : "Infirmier(ère)"}
                                secondary={user?.email ?? (user ? roleLabels[user.role] : "")}
                            />
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutRounded fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Déconnexion" />
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardHeader;
