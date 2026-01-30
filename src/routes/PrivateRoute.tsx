import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}
