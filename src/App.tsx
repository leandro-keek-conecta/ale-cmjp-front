import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes/AppRoutes";
import VLibrasWidget from "./components/VLibrasWidget";

const App = () => (
  <BrowserRouter>
    <VLibrasWidget disabledOnPaths={["/relatorio", "/login"]} />
    <RoutesConfig />
  </BrowserRouter>
);

export default App;
