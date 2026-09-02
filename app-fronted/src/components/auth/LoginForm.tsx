import React, { useState } from 'react';
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
} from '@mui/material';
import {
    PersonOutlineRounded,
    LockOutlined,
    Visibility,
    VisibilityOff,
    ShieldRounded,
    LocalHospitalRounded,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

export interface LoginFormProps {
    onSubmit: (data: LoginFormData) => Promise<void> | void;
    isLoading?: boolean;
}

const validationSchema = yup.object({
    email: yup
        .string()
        .required("L'adresse e-mail est obligatoire")
        .email('Veuillez saisir une adresse e-mail valide'),
    password: yup
        .string()
        .required('Le mot de passe est obligatoire')
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    remember: yup.boolean().default(false),
});

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
        mode: 'onTouched',
    });

    const handleTogglePasswordVisibility = (): void => {
        setShowPassword((prev) => !prev);
    };

    const handleFormSubmit = async (data: LoginFormData): Promise<void> => {
        await onSubmit(data);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f6f9',
                padding: { xs: 2, sm: 4 },
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ width: '100%', maxWidth: 460 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        borderRadius: 4,
                        padding: { xs: 3, sm: 5 },
                        backgroundColor: '#ffffff',
                        boxShadow: '0px 12px 40px rgba(15, 45, 90, 0.10)',
                        border: '1px solid rgba(15, 45, 90, 0.06)',
                    }}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        >
                            <Avatar
                                sx={{
                                    width: 72,
                                    height: 72,
                                    backgroundColor: '#1565c0',
                                    boxShadow: '0px 8px 24px rgba(21, 101, 192, 0.35)',
                                    mb: 2,
                                }}
                            >
                                <LocalHospitalRounded sx={{ fontSize: 36, color: '#ffffff' }} />
                            </Avatar>
                        </motion.div>

                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#0f2d5a',
                                textAlign: 'center',
                            }}
                        >
                            Connexion sécurisée
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#6b7a90',
                                textAlign: 'center',
                                mt: 0.5,
                            }}
                        >
                            Connectez-vous à votre espace professionnel
                        </Typography>
                    </Box>

                    <Box
                        component="form"
                        noValidate
                        onSubmit={handleSubmit(handleFormSubmit)}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    type="email"
                                    label="Adresse e-mail"
                                    placeholder="exemple@chu-oujda.ma"
                                    autoComplete="email"
                                    error={Boolean(errors.email)}
                                    helperText={errors.email ? errors.email.message : ' '}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutlineRounded sx={{ color: '#8a94a6' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2.5,
                                            backgroundColor: '#f8fafc',
                                        },
                                    }}
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
                                    type={showPassword ? 'text' : 'password'}
                                    label="Mot de passe"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    error={Boolean(errors.password)}
                                    helperText={errors.password ? errors.password.message : ' '}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined sx={{ color: '#8a94a6' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="basculer la visibilité du mot de passe"
                                                    onClick={handleTogglePasswordVisibility}
                                                    edge="end"
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff sx={{ color: '#8a94a6' }} />
                                                    ) : (
                                                        <Visibility sx={{ color: '#8a94a6' }} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2.5,
                                            backgroundColor: '#f8fafc',
                                        },
                                    }}
                                />
                            )}
                        />

                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            flexWrap="wrap"
                            gap={1}
                            mt={-1}
                        >
                            <Controller
                                name="remember"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                sx={{
                                                    color: '#8a94a6',
                                                    '&.Mui-checked': {
                                                        color: '#1565c0',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: '#455168' }}>
                                                Se souvenir de moi
                                            </Typography>
                                        }
                                    />
                                )}
                            />

                            <Link
                                href="#"
                                underline="hover"
                                variant="body2"
                                sx={{
                                    color: '#1565c0',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Mot de passe oublié ?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            disableElevation
                            sx={{
                                mt: 1,
                                py: 1.4,
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                letterSpacing: 0.5,
                                backgroundColor: '#1565c0',
                                color: '#ffffff',
                                boxShadow: '0px 10px 24px rgba(21, 101, 192, 0.35)',
                                '&:hover': {
                                    backgroundColor: '#0d4d9c',
                                    boxShadow: '0px 12px 28px rgba(21, 101, 192, 0.45)',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#7fa8d9',
                                    color: '#ffffff',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                            ) : (
                                'SE CONNECTER'
                            )}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                backgroundColor: '#eef4fb',
                                borderRadius: 2.5,
                                padding: 2,
                                border: '1px solid rgba(21, 101, 192, 0.12)',
                            }}
                        >
                            <ShieldRounded sx={{ color: '#1565c0', fontSize: 28 }} />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#3a4a63',
                                    lineHeight: 1.4,
                                }}
                            >
                                Cette connexion est protégée par un chiffrement sécurisé.
                            </Typography>
                        </Box>

                        <Typography
                            variant="caption"
                            display="block"
                            textAlign="center"
                            sx={{
                                color: '#9aa4b5',
                                mt: 2.5,
                                fontWeight: 500,
                                letterSpacing: 0.3,
                            }}
                        >
                            CHU Mohammed VI Oujda
                        </Typography>
                    </motion.div>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default LoginForm;