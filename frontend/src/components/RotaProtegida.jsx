import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RotaProtegida({ children, apenasAdmin = false }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" />;
  if (apenasAdmin && usuario.perfil !== "admin") return <Navigate to="/" />;

  return children;
}
