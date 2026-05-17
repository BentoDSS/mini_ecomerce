import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CardProduto from "../components/CardProduto";
import "../styles/Home.css";

export default function Home() {
  const [produtosDestaque, setProdutosDestaque] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProdutosDestaque() {
      try {
        const response = await api.get("/api/produtos");
        // Pega os 6 primeiros produtos como destaque
        setProdutosDestaque(response.data.slice(0, 6));
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutosDestaque();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bem-vindo ao ComprasJá</h1>
          <p>A sua loja online de confiança com os melhores produtos</p>
          <button 
            className="hero-button"
            onClick={() => navigate("/catalogo")}
          >
            Explorar Catálogo
          </button>
        </div>
        <div className="hero-background">
          <div className="gradient-orb gradient-orb-1"></div>
          <div className="gradient-orb gradient-orb-2"></div>
        </div>
      </section>

      {/* Categorias Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Categorias Populares</h2>
          <p>Encontre o que você procura</p>
        </div>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">🛍️</div>
            <h3>Eletrônicos</h3>
            <p>Últimas tecnologias</p>
          </div>
          <div className="category-card">
            <div className="category-icon">👗</div>
            <h3>Moda</h3>
            <p>Tendências do momento</p>
          </div>
          <div className="category-card">
            <div className="category-icon">🏠</div>
            <h3>Casa</h3>
            <p>Produtos para o lar</p>
          </div>
          <div className="category-card">
            <div className="category-icon">📚</div>
            <h3>Livros</h3>
            <p>Conhecimento e lazer</p>
          </div>
        </div>
      </section>

      {/* Destaques Section */}
      <section className="highlights-section">
        <div className="section-header">
          <h2>Produtos em Destaque</h2>
          <p>Confira as nossas seleções especiais</p>
        </div>

        {loading ? (
          <div className="loading">Carregando produtos...</div>
        ) : produtosDestaque.length > 0 ? (
          <div className="product-grid">
            {produtosDestaque.map((produto) => (
              <CardProduto key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhum produto disponível no momento</p>
          </div>
        )}

        <div className="section-footer">
          <button 
            className="view-more-button"
            onClick={() => navigate("/catalogo")}
          >
            Ver Todos os Produtos →
          </button>
        </div>
      </section>

      {/* Vantagens Section */}
      <section className="advantages-section">
        <div className="section-header">
          <h2>Por que Comprar Conosco</h2>
        </div>
        <div className="advantages-grid">
          <div className="advantage-card">
            <div className="advantage-icon">⚡</div>
            <h3>Rápido</h3>
            <p>Entrega rápida e eficiente em toda região</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">🛡️</div>
            <h3>Seguro</h3>
            <p>Compras 100% seguras e protegidas</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">💰</div>
            <h3>Preço Justo</h3>
            <p>Os melhores preços da região</p>
          </div>
          <div className="advantage-card">
            <div className="advantage-icon">🤝</div>
            <h3>Suporte</h3>
            <p>Atendimento ao cliente sempre disponível</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Pronto para começar suas compras?</h2>
        <p>Junte-se a milhares de clientes satisfeitos</p>
        <button 
          className="cta-button"
          onClick={() => navigate("/catalogo")}
        >
          Acessar Catálogo
        </button>
      </section>
    </div>
  );
}
