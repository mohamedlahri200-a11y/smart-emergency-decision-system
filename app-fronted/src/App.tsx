import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import loginTheme from "./theme/loginTheme";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";

import InfirmierDashboardPage from "./components/dashboard/infirmier/InfirmierDashboardPage";
import InfirmierPatientsPage from "./components/dashboard/infirmier/InfirmierPatientsPage";
import InfirmierTriagePage from "./components/dashboard/infirmier/InfirmierTriagePage";
import InfirmierHistoriquePage from "./components/dashboard/infirmier/InfirmierHistoriquePage";

import MedecinDashboardPage from "./components/dashboard/medecin/MedecinDashboardPage";
import MedecinPatientsPage from "./components/dashboard/medecin/MedecinPatientsPage";
import MedecinHistoriquePage from "./components/dashboard/medecin/MedecinHistoriquePage";
import MedecinAideIAPage from "./components/dashboard/medecin/MedecinAideIAPage";
import MedecinNotificationsPage from "./components/dashboard/medecin/MedecinNotificationsPage";

import RadiologueDashboardPage from "./components/dashboard/radiologue/RadiologueDashboardPage";
import RadiologueExamensPage from "./components/dashboard/radiologue/RadiologueExamensPage";
import RadiologueHistoriquePage from "./components/dashboard/radiologue/RadiologueHistoriquePage";
import RadiologueAideIAPage from "./components/dashboard/radiologue/RadiologueAideIAPage";

import BiologisteDashboardPage from "./components/dashboard/biologiste/BiologisteDashboardPage";
import BiologisteAnalysesPage from "./components/dashboard/biologiste/BiologisteAnalysesPage";
import BiologisteHistoriquePage from "./components/dashboard/biologiste/BiologisteHistoriquePage";
import BiologisteAideIAPage from "./components/dashboard/biologiste/BiologisteAideIAPage";

import ChefServiceDashboardPage from "./components/dashboard/chef-service/ChefServiceDashboardPage";

import DashboardIndisponiblePage from "./pages/dashboard/DashboardIndisponiblePage";

import RequireRole from "./routes/RequireRole";
import { getHomePathForRole, getStoredUser } from "./utils/authUser";

function DashboardRedirect() {
    const user = getStoredUser();
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={getHomePathForRole(user.role)} replace />;
}

function App() {
    return (
        <ThemeProvider theme={loginTheme}>
            <CssBaseline />

            <Routes>

                <Route path="/" element={<LandingPage />} />

                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/dashboard/infirmier"
                    element={<RequireRole allowedRoles={["INFIRMIER"]}><InfirmierDashboardPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/infirmier/patients"
                    element={<RequireRole allowedRoles={["INFIRMIER"]}><InfirmierPatientsPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/infirmier/triage"
                    element={<RequireRole allowedRoles={["INFIRMIER"]}><InfirmierTriagePage /></RequireRole>}
                />
                <Route
                    path="/dashboard/infirmier/historique"
                    element={<RequireRole allowedRoles={["INFIRMIER"]}><InfirmierHistoriquePage /></RequireRole>}
                />

                <Route
                    path="/dashboard/medecin"
                    element={<RequireRole allowedRoles={["MEDECIN"]}><MedecinDashboardPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/medecin/patients"
                    element={<RequireRole allowedRoles={["MEDECIN"]}><MedecinPatientsPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/medecin/historique"
                    element={<RequireRole allowedRoles={["MEDECIN"]}><MedecinHistoriquePage /></RequireRole>}
                />
                <Route
                    path="/dashboard/medecin/aide-ia"
                    element={<RequireRole allowedRoles={["MEDECIN"]}><MedecinAideIAPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/medecin/notifications"
                    element={<RequireRole allowedRoles={["MEDECIN"]}><MedecinNotificationsPage /></RequireRole>}
                />

                <Route
                    path="/dashboard/radiologue"
                    element={<RequireRole allowedRoles={["RADIOLOGUE"]}><RadiologueDashboardPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/radiologue/examens"
                    element={<RequireRole allowedRoles={["RADIOLOGUE"]}><RadiologueExamensPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/radiologue/historique"
                    element={<RequireRole allowedRoles={["RADIOLOGUE"]}><RadiologueHistoriquePage /></RequireRole>}
                />
                <Route
                    path="/dashboard/radiologue/aide-ia"
                    element={<RequireRole allowedRoles={["RADIOLOGUE"]}><RadiologueAideIAPage /></RequireRole>}
                />

                <Route
                    path="/dashboard/biologiste"
                    element={<RequireRole allowedRoles={["BIOLOGISTE"]}><BiologisteDashboardPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/biologiste/analyses"
                    element={<RequireRole allowedRoles={["BIOLOGISTE"]}><BiologisteAnalysesPage /></RequireRole>}
                />
                <Route
                    path="/dashboard/biologiste/historique"
                    element={<RequireRole allowedRoles={["BIOLOGISTE"]}><BiologisteHistoriquePage /></RequireRole>}
                />
                <Route
                    path="/dashboard/biologiste/aide-ia"
                    element={<RequireRole allowedRoles={["BIOLOGISTE"]}><BiologisteAideIAPage /></RequireRole>}
                />

                <Route
                    path="/dashboard/chef-service"
                    element={<RequireRole allowedRoles={["CHEF_SERVICE"]}><ChefServiceDashboardPage /></RequireRole>}
                />

                <Route path="/dashboard/indisponible" element={<DashboardIndisponiblePage />} />

                <Route path="/dashboard" element={<DashboardRedirect />} />

                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

        </ThemeProvider>
    );
}

export default App;