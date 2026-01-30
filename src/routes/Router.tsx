import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Panorama/Panorama";
import FormsPage from "../pages/formPage";
import EmbedDashboardPage from "../pages/dashboards/EmbedDashboardPage";
import RelatorioPage from "../pages/relatoriopage";
import LoginPage from "../pages/login";
import { AuthProvider } from "../context/AuthContext";
import NotFound from "../pages/notFound/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

const RoutesConfig = () => (
  <AuthProvider>
    <Routes>
      <Route path="/panorama" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><HomePage /></ProtectedRoute>} />
      <Route path="/relatorio" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><RelatorioPage /></ProtectedRoute>} />
      <Route path="/dashboards/embed/:id" element={<EmbedDashboardPage />} />
      <Route path="/form-page" element={<FormsPage />} />


      <Route path="/" element={<LoginPage />} />

      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default RoutesConfig;
