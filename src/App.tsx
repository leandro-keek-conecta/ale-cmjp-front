import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes/Router";
import VLibrasWidget from "./components/VLibrasWidget";
import ScrollToTop from "./components/ScrollToTop";

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <VLibrasWidget disabledOnPaths={["/relatorio", "/login", "/cadastro-usuario", "/cadastro-projeto", "/projetos", "/forms-constructor", "/constructor-forms"]} />
    <RoutesConfig />
  </BrowserRouter>
);

export default App;
