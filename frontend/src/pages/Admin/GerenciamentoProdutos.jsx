import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function GerenciamentoProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: 0,
    quantidade_estoque: 0,
    categoria: '',
    ativo: true,
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos', error);
      alert('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const openModalForCreate = () => {
    setEditingProduto(null);
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      quantidade_estoque: 0,
      categoria: '',
      ativo: true,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      quantidade_estoque: produto.quantidade_estoque,
      categoria: produto.categoria || '',
      ativo: produto.ativo,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduto) {
        await api.put(`/api/produtos/${editingProduto.id}`, formData);
        alert('Produto atualizado com sucesso!');
      } else {
        await api.post('/api/produtos', formData);
        alert('Produto criado com sucesso!');
      }
      closeModal();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await api.delete(`/api/produtos/${id}`);
        alert('Produto deletado com sucesso!');
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao deletar produto', error);
        alert('Erro ao deletar produto');
      }
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state"><div className="loader"></div>Carregando...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gerenciamento de Produtos</h2>
          <p>Administre o catálogo da loja.</p>
        </div>
        <button className="btn-primary" onClick={openModalForCreate}>
          + Novo Produto
        </button>
      </div>

      <div className="table-container" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-light)', paddingBottom: '1rem' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Nome</th>
              <th style={{ padding: '1rem' }}>Preço</th>
              <th style={{ padding: '1rem' }}>Estoque</th>
              <th style={{ padding: '1rem' }}>Categoria</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto cadastrado.</td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                  <td style={{ padding: '1rem' }}>{produto.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{produto.nome}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                  </td>
                  <td style={{ padding: '1rem' }}>{produto.quantidade_estoque}</td>
                  <td style={{ padding: '1rem' }}>{produto.categoria || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: produto.ativo ? '#d1fae5' : '#fee2e2',
                      color: produto.ativo ? '#065f46' : '#991b1b'
                    }}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => openModalForEdit(produto)}
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'var(--gray-light)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id)}
                      style={{ padding: '0.5rem 1rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', color: '#000', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Preço (R$)</label>
                  <input required type="number" step="0.01" name="preco" value={formData.preco} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Estoque</label>
                  <input required type="number" name="quantidade_estoque" value={formData.quantidade_estoque} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Categoria</label>
                <input type="text" name="categoria" value={formData.categoria} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="ativo" name="ativo" checked={formData.ativo} onChange={handleInputChange} />
                <label htmlFor="ativo" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Produto Ativo no Catálogo</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} style={{ padding: '0.75rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', color: '#1e293b', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
