import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import OpinionsPage from "../pages/opinioes/OpinionsPage";
import SearchCardsPage from "../pages/playground/SearchCardsPage";
import FormsPage from "../pages/test";

const RoutesConfig = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/opinioes" element={<OpinionsPage />} />
    <Route path="/playground-search" element={<SearchCardsPage />} />
    <Route path="/test-page" element={<FormsPage />} />
    {/* <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default RoutesConfig;
