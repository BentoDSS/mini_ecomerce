import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Cadastro() {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/cadastro', {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      });
      alert('Cadastro realizado com sucesso! Faça o login.');
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem' }}>
      <div style={{ background: 'white', color: '#000', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Criar Conta</h2>
          <p style={{ color: '#64748b' }}>Preencha os dados para se cadastrar</p>
        </div>

        {erro && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e293b' }}>Nome Completo</label>
            <input required type="text" name="nome" value={formData.nome} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', color: '#1e293b' }}
              placeholder="Seu nome" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e293b' }}>E-mail</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', color: '#1e293b' }}
              placeholder="seu@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e293b' }}>Senha</label>
            <input required type="password" name="senha" value={formData.senha} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', color: '#1e293b' }}
              placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#1e293b' }}>Confirmar Senha</label>
            <input required type="password" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', color: '#1e293b' }}
              placeholder="Repita a senha" />
          </div>
          <button type="submit" disabled={loading}
            style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1rem', width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
