import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import chuLogo from "../../assets/images/chu-logo.png";

const menuItems = [
    { label: "Accueil", to: "hero" },
    { label: "À propos", to: "about" },
    { label: "Fonctionnalités", to: "features" },
    { label: "Nos métiers", to: "metiers" },
    { label: "Contact", to: "contact" }
];

function allerVersSection(id: string) {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <style>{`
                #hero, #about, #features, #metiers, #contact { scroll-margin-top: 84px; }
                .nav-link { color: #0D47A1; background: none; border: none; }
                .nav-link:hover { color: #1976D2; border-color: #1976D2 !important; }
            `}</style>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: "rgba(255,255,255,0.90)",
                    backdropFilter: "blur(12px)",
                    color: "#0D47A1",
                    borderBottom: "1px solid #E5E7EB"
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters>

                        <Box
                            onClick={() => allerVersSection("hero")}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer"
                            }}
                        >
                            <Box
                                component="img"
                                src={chuLogo}
                                alt="CHU Mohammed VI Oujda"
                                sx={{
                                    width: 70,
                                    height: 70,
                                    objectFit: "contain"
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                CHU Mohammed VI
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Box
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "flex"
                                },
                                gap: 3
                            }}
                        >
                            {menuItems.map((item) => (
                                <Box
                                    key={item.to}
                                    component="button"
                                    onClick={() => allerVersSection(item.to)}
                                    className="nav-link"
                                    sx={{
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        fontFamily: "inherit",
                                        padding: "8px 4px",
                                        borderBottom: "2px solid transparent",
                                        transition: "color 0.2s ease, border-color 0.2s ease",
                                    }}
                                >
                                    {item.label}
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="contained"
                            sx={{
                                display: {
                                    xs: "none",
                                    md: "inline-flex"
                                },
                                borderRadius: 8,
                                textTransform: "none"
                            }}
                        >
                            Se connecter
                        </Button>

                        <IconButton
                            sx={{
                                display: {
                                    xs: "flex",
                                    md: "none"
                                }
                            }}
                            onClick={() => setOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>

                    </Toolbar>
                </Container>
            </AppBar>

            <Toolbar />

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
            >
                <Box sx={{ width: 260 }}>

                    <List>

                        {menuItems.map((item) => (

                            <ListItem
                                key={item.to}
                                disablePadding
                            >
                                <ListItemButton
                                    onClick={() => {
                                        setOpen(false);
                                        allerVersSection(item.to);
                                    }}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>

                        ))}

                        <ListItem disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to="/login"
                            >
                                <ListItemText primary="Se connecter" />
                            </ListItemButton>
                        </ListItem>

                    </List>

                </Box>
            </Drawer>
        </>
    );
}