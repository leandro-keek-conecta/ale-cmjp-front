import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

export function PrivateRoute({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}
