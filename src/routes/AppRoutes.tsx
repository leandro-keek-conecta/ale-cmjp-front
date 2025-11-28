import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OpinionsPage from "../pages/opinioes/OpinionsPage";
import HomePage from "../pages/home/HomePage";
// Páginas

const RoutesConfig = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/opinioes" element={<OpinionsPage />} />

    {/*       <Route path="*" element={<NotFound />} /> */}
  </Routes>
);

export default RoutesConfig;
