// src/utils/authUser.ts
export type AppRole =
    | "ADMIN"
    | "MEDECIN"
    | "INFIRMIER"
    | "RECEPTIONNISTE"
    | "RADIOLOGUE"
    | "BIOLOGISTE"
    | "CHEF_SERVICE";

export interface StoredUser {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: AppRole;
}

export function getStoredUser(): StoredUser | null {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.role) return null;
        return parsed as StoredUser;
    } catch {
        return null;
    }
}

export const roleLabels: Record<AppRole, string> = {
    ADMIN: "Administrateur",
    MEDECIN: "Médecin urgentiste",
    INFIRMIER: "Infirmier d'accueil",
    RECEPTIONNISTE: "Agent d'accueil",
    RADIOLOGUE: "Médecin radiologue",
    BIOLOGISTE: "Biologiste médical",
    CHEF_SERVICE: "Chef de service des urgences",
};

/**
 * Détermine le dashboard de destination selon le rôle de l'utilisateur
 * connecté. Un seul point de vérité, utilisé à la fois après connexion
 * et pour la route générique /dashboard (rafraîchissement de page).
 */
export function getHomePathForRole(role: AppRole | undefined | null): string {
    switch (role) {
        case "MEDECIN":
            return "/dashboard/medecin";
        case "INFIRMIER":
            return "/dashboard/infirmier";
        case "RADIOLOGUE":
            return "/dashboard/radiologue";
        case "BIOLOGISTE":
            return "/dashboard/biologiste";
        case "CHEF_SERVICE":
            return "/dashboard/chef-service";
        case "ADMIN":
        case "RECEPTIONNISTE":
        default:
            return "/dashboard/indisponible";
    }
}
