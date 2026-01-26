import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import OpinionsPage from "../pages/opinioes/OpinionsPage";
import SearchCardsPage from "../pages/playground/SearchCardsPage";
import FormsPage from "../pages/formPage";
import EmbedDashboardPage from "../pages/dashboards/EmbedDashboardPage";
import RelatorioPage from "../pages/relatoriopage";
import LoginPage from "../pages/login";
import LoginAnotherPage from "../pages/login copy";

const RoutesConfig = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboards/embed/:id" element={<EmbedDashboardPage />} />
    <Route path="/opinioes" element={<OpinionsPage />} />
    <Route path="/playground-search" element={<SearchCardsPage />} />
    <Route path="/form-page" element={<FormsPage />} />
    <Route path="/relatorio" element={<RelatorioPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/login-2" element={<LoginAnotherPage />} />
    {/* <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default RoutesConfig;
