import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header>
      <h1>ComprasJá</h1>
      <nav>
        <button onClick={() => navigate("/")}>Catálogo</button>

        {usuario?.perfil === "admin" && (
          <button onClick={() => navigate("/admin")}>Painel Admin</button>
        )}

        {usuario ? (
          <>
            <span>Olá, {usuario.nome}</span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <button onClick={() => navigate("/login")}>Entrar</button>
        )}
      </nav>
    </header>
  );
}
