import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes/Router";
import VLibrasWidget from "./components/VLibrasWidget";
import ScrollToTop from "./components/ScrollToTop";
import { AlertProvider } from "./context/AlertContext";
import { ProjectProvider } from "./context/ProjectContext";

const App = () => (
  <AlertProvider>
    <ProjectProvider>
      <BrowserRouter>
        <ScrollToTop />
        <VLibrasWidget disabledOnPaths={["/relatorio", "/login", "/cadastro-usuario", "/cadastro-projeto", "/projetos", "/forms-constructor", "/constructor-forms"]} />
        <RoutesConfig />
      </BrowserRouter>
    </ProjectProvider>
  </AlertProvider>
);

export default App;
