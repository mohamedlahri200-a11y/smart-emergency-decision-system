





























import React, { useState } from "react";
import apiClient from "../../services/apiClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
    Box,
    Paper,
    Avatar,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    Button,
    CircularProgress,
    Link,
    Divider,
    Alert,
    Snackbar,
} from "@mui/material";

import {
    PersonOutlineRounded,
    LockOutlined,
    LockRounded,
    Visibility,
    VisibilityOff,
    ShieldRounded,
    LoginRounded,
    MonitorHeartRounded,
} from "@mui/icons-material";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { isAxiosError } from "axios";

import LoginHeader from "../../components/auth/LoginHeader";
import BackgroundShapes from "../../components/auth/BackgroundShapes";
import type { LoginFormData } from "../../components/auth/LoginForm";
import { getHomePathForRole } from "../../utils/authUser";

import "../../styles/styles/login.css";

const validationSchema = yup.object({
    email: yup
        .string()
        .required("L'adresse email est obligatoire")
        .email("Veuillez saisir une adresse email valide"),
    password: yup
        .string()
        .required("Le mot de passe est obligatoire")
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    remember: yup.boolean().default(false),
});

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
        mode: "onTouched",
    });

    const handleTogglePasswordVisibility = (): void => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async (data: LoginFormData): Promise<void> => {
        try {
            setLoading(true);
            setError("");

            // Le backend (LoginRequestDTO) attend "motDePasse", pas "password"
            const response = await apiClient.post("/auth/login", {
                email: data.email,
                motDePasse: data.password,
            });

            // AuthResponseDTO renvoie un objet plat : { token, type, id, nom, prenom, email, role }
            const { token, id, nom, prenom, email, role } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify({ id, nom, prenom, email, role })
            );

            navigate(getHomePathForRole(role), { replace: true });
        } catch (err) {
            console.error(err);

            if (isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError("Adresse email ou mot de passe incorrect.");
                } else if (err.response?.status === 400) {
                    setError("Champs invalides. Vérifiez l'email et le mot de passe.");
                } else if (!err.response) {
                    setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
                } else {
                    setError(
                        "Une erreur est survenue. Veuillez réessayer dans quelques instants."
                    );
                }
            } else {
                setError(
                    "Une erreur est survenue. Veuillez réessayer dans quelques instants."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                background:
                    "radial-gradient(circle at top, #ffffff 0%, #eef5ff 45%, #dbeafe 100%)",
                pb: { xs: 6, md: 8 },
            }}
        >
            <BackgroundShapes />

            <Box sx={{ width: "100%", position: "relative", zIndex: 2 }}>
                <LoginHeader />
            </Box>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 2, padding: "0 16px" }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: "100%",
                        borderRadius: 6,
                        p: { xs: 3, sm: 5.5 },
                        backgroundColor: "#ffffff",
                        boxShadow: "0 20px 55px rgba(13, 71, 161, 0.14)",
                        border: "1px solid rgba(13, 71, 161, 0.06)",
                    }}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" mb={3.5}>
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        >
                            <Avatar
                                sx={{
                                    width: 88,
                                    height: 88,
                                    backgroundColor: "#0D47A1",
                                    boxShadow: "0 12px 28px rgba(13, 71, 161, 0.35)",
                                    mb: 2.5,
                                }}
                            >
                                <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ShieldRounded sx={{ fontSize: 52, color: "#ffffff" }} />
                                    <LockRounded
                                        sx={{
                                            position: "absolute",
                                            fontSize: 20,
                                            color: "#0D47A1",
                                            backgroundColor: "#ffffff",
                                            borderRadius: "50%",
                                            padding: "3px",
                                        }}
                                    />
                                </Box>
                            </Avatar>
                        </motion.div>

                        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: "#0D47A1", textAlign: "center" }}>
                            Connexion sécurisée
                        </Typography>

                        <Typography variant="body2" sx={{ color: "#6b7a90", textAlign: "center", mt: 0.5 }}>
                            Veuillez vous connecter à votre compte
                        </Typography>
                    </Box>

                    <Box component="form" noValidate onSubmit={handleSubmit(handleLogin)} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    type="email"
                                    label="Adresse email"
                                    autoComplete="email"
                                    error={Boolean(errors.email)}
                                    helperText={errors.email ? errors.email.message : " "}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutlineRounded sx={{ color: "#8a94a6" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, backgroundColor: "#f8fafc" } }}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    label="Mot de passe"
                                    autoComplete="current-password"
                                    error={Boolean(errors.password)}
                                    helperText={errors.password ? errors.password.message : " "}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined sx={{ color: "#8a94a6" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton aria-label="basculer la visibilité du mot de passe" onClick={handleTogglePasswordVisibility} edge="end">
                                                    {showPassword ? <VisibilityOff sx={{ color: "#8a94a6" }} /> : <Visibility sx={{ color: "#8a94a6" }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, backgroundColor: "#f8fafc" } }}
                                />
                            )}
                        />

                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mt={-1}>
                            <Controller
                                name="remember"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                sx={{ color: "#8a94a6", "&.Mui-checked": { color: "#0D47A1" } }}
                                            />
                                        }
                                        label={<Typography variant="body2" sx={{ color: "#455168" }}>Se souvenir de moi</Typography>}
                                    />
                                )}
                            />

                            <Link component="button" type="button" underline="hover" variant="body2" sx={{ color: "#0D47A1", fontWeight: 600, whiteSpace: "nowrap" }}>
                                Mot de passe oublié ?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            disableElevation
                            startIcon={!loading ? <LoginRounded /> : null}
                            sx={{
                                mt: 1,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "1rem",
                                letterSpacing: 0.5,
                                background: "linear-gradient(90deg, #1565C0, #0D47A1)",
                                color: "#ffffff",
                                boxShadow: "0 12px 26px rgba(13, 71, 161, 0.35)",
                                "&:hover": { background: "linear-gradient(90deg, #0d55a3, #08306B)", boxShadow: "0 14px 30px rgba(13, 71, 161, 0.45)" },
                                "&.Mui-disabled": { background: "#7fa8d9", color: "#ffffff" },
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "SE CONNECTER"}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#8a94a6" }}>
                            <LockOutlined sx={{ fontSize: 18 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Connexion sécurisée SSL</Typography>
                        </Box>
                    </Divider>
                </Paper>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 2, padding: "0 16px" }}
            >
                <Box sx={{ textAlign: "center", mt: { xs: 5, md: 7 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 2 }}>
                        <Box sx={{ width: 90, height: 2, bgcolor: "#F2A93B" }} />
                        <MonitorHeartRounded sx={{ color: "#F2A93B", fontSize: 32 }} />
                        <Box sx={{ width: 90, height: 2, bgcolor: "#F2A93B" }} />
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.35rem" }, color: "#173b80" }}>
                        Chaque décision intelligente aujourd&apos;hui,
                    </Typography>

                    <Typography sx={{ fontWeight: 700, fontStyle: "italic", fontSize: { xs: "1.1rem", md: "1.35rem" }, color: "#0D47A1" }}>
                        peut sauver une vie demain.
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 3, mb: 2 }}>
                        <Box sx={{ flex: 1, height: "1px", bgcolor: "#cfe0f5" }} />
                        <Box sx={{ flex: 1, height: "1px", bgcolor: "#cfe0f5" }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: "#667085" }}>
                        CHU Mohammed VI Oujda &copy; {new Date().getFullYear()}
                    </Typography>
                </Box>
            </motion.div>

            <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity="error" variant="filled" onClose={() => setError("")} sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;