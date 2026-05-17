import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Admin/Dashboard";
import GerenciamentoProdutos from "./pages/Admin/GerenciamentoProdutos";
import GerenciamentoUsuarios from "./pages/Admin/GerenciamentoUsuarios";
import RotaProtegida from "./components/RotaProtegida";

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas — somente admin */}
        <Route path="/admin" element={
          <RotaProtegida apenasAdmin>
            <Dashboard />
          </RotaProtegida>
        } />
        <Route path="/admin/produtos" element={
          <RotaProtegida apenasAdmin>
            <GerenciamentoProdutos />
          </RotaProtegida>
        } />
        <Route path="/admin/usuarios" element={
          <RotaProtegida apenasAdmin>
            <GerenciamentoUsuarios />
          </RotaProtegida>
        } />
    </Routes>
  );
}
