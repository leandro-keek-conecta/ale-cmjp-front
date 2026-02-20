import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Panorama/Panorama";
import FormsPage from "../pages/formPage";
import EmbedDashboardPage from "../pages/dashboards/EmbedDashboardPage";
import RelatorioPage from "../pages/relatoriopage";
import LoginPage from "../pages/login";
import { AuthProvider } from "../context/AuthContext";
import NotFound from "../pages/notFound/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import DinamicFormsPage from "../pages/DinamicFormPage";
import RegisterUser from "@/pages/registerUser/RegisterUser";
import RegisterProject from "@/pages/registerProject/RegisterProject";
import ProjetoThemeTab from "@/pages/ProjetoThemeTab/ProjetoThemeTab";
import Projetos from "@/pages/projects/Projetos";
import ConstructorForm from "@/pages/formsConstructorT/FormsConstructor";

const RoutesConfig = () => (
  <AuthProvider>
    <Routes>
      <Route path="/panorama" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><HomePage /></ProtectedRoute>} />
      <Route path="/relatorio" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><RelatorioPage /></ProtectedRoute>} />
      <Route path="/cadastro-usuario" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><RegisterUser /></ProtectedRoute>} />
      <Route path="/cadastro-projeto" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><RegisterProject /></ProtectedRoute>} />
      <Route path="/cadastro-thema" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><ProjetoThemeTab /></ProtectedRoute>} />
      <Route path="/projetos" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><Projetos /></ProtectedRoute>} />
      <Route path="/constructor-forms" element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPERADMIN"]}><ConstructorForm /></ProtectedRoute>} />
      <Route path="/dashboards/embed/:id" element={<EmbedDashboardPage />} />
      <Route path="/form-page" element={<FormsPage />} />
      <Route path="/form/:project/:slug" element={<DinamicFormsPage />} />
      <Route path="/form/:slug" element={<DinamicFormsPage />} />


      <Route path="/" element={<LoginPage />} />

      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default RoutesConfig;
