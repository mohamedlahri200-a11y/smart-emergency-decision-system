// src/routes/RequireRole.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, getHomePathForRole, type AppRole } from "../utils/authUser";

interface Props {
    allowedRoles: AppRole[];
    children: React.ReactNode;
}

/**
 * Protège une route selon le(s) rôle(s) autorisé(s) :
 * - Aucun utilisateur connecté -> renvoi vers /login.
 * - Utilisateur connecté mais rôle non autorisé pour cette page -> renvoi
 *   automatique vers SON propre dashboard.
 * - Rôle autorisé -> affiche la page normalement.
 */
const RequireRole: React.FC<Props> = ({ allowedRoles, children }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token || !user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={getHomePathForRole(user.role)} replace />;
    }

    return <>{children}</>;
};

export default RequireRole;