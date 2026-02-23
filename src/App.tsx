import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes/Router";
import VLibrasWidget from "./components/VLibrasWidget";
import ScrollToTop from "./components/ScrollToTop";
import { AlertProvider } from "./context/AlertContext";

const App = () => (
  <AlertProvider>
    <BrowserRouter>
      <ScrollToTop />
      <VLibrasWidget disabledOnPaths={["/relatorio", "/login", "/cadastro-usuario", "/cadastro-projeto", "/projetos", "/forms-constructor", "/constructor-forms"]} />
      <RoutesConfig />
    </BrowserRouter>
  </AlertProvider>
);

export default App;
