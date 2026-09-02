export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',

    // Dashboard métier de l'infirmier d'accueil
    NURSE_DASHBOARD: '/infirmier/dashboard',

    PATIENTS: '/patients',
    PATIENT_DETAIL: (id: string | number) => `/patients/${id}`,
    PATIENT_EDIT: (id: string | number) => `/patients/${id}/modifier`,
    PATIENT_NEW: '/patients/nouveau',

    TRIAGES: '/triages',
    TRIAGE_DETAIL: (id: string | number) => `/triages/${id}`,

    ORIENTATION: '/orientation',
    MEDICAL_FOLLOWUP: '/suivi-medical',
    TREATMENTS: '/traitements',
    CONSULTATIONS: '/consultations',
    APPOINTMENTS: '/rendez-vous',
    EXAMS: '/examens',
    LABORATORY: '/laboratoire',
    DOCUMENTS: '/documents',
    AI: '/assistant-ia',
    STATISTICS: '/statistiques',
    USERS: '/utilisateurs',
    ROLES: '/roles',
    SETTINGS: '/parametres',
} as const