import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <h2>Bem-vindo, {usuario?.nome}! 👋</h2>
        <p>Este é o seu painel de controle do ComprasJá.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <Link to="/admin/produtos" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', height: '100%' }}>
            <h3 style={{ color: '#818cf8', fontSize: '1.5rem', marginBottom: '1rem' }}>📦 Produtos</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Gerencie seu catálogo de produtos, preços e estoque.</p>
          </div>
        </Link>

        <Link to="/admin/usuarios" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', height: '100%' }}>
            <h3 style={{ color: '#818cf8', fontSize: '1.5rem', marginBottom: '1rem' }}>👥 Usuários</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Administre quem tem acesso ao painel de controle.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
