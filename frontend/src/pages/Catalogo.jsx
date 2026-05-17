import React, { useEffect, useState } from "react";
import api from "../services/api";
import CardProduto from "../components/CardProduto";

export default function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await api.get("/api/produtos");
        setProdutos(response.data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar o catálogo no momento.");
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Catálogo de Produtos</h2>
        <p>Explore as novidades que separamos para você.</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Carregando produtos maravilhosos...</p>
        </div>
      )}

      {error && (
        <div className="empty-state" style={{ color: "var(--danger)" }}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && produtos.length === 0 && (
        <div className="empty-state">
          <p>Nenhum produto disponível no catálogo ainda. Volte em breve!</p>
        </div>
      )}

      {!loading && !error && produtos.length > 0 && (
        <div className="product-grid">
          {produtos.map((produto) => (
            <CardProduto key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </div>
  );
}
