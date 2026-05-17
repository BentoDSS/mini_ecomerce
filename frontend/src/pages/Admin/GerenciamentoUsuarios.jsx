import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function GerenciamentoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'user',
    ativo: true,
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
      alert('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const openModalForCreate = () => {
    setEditingUsuario(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      perfil: 'user',
      ativo: true,
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Senha em branco na edição (só envia se preencher algo)
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Se for edição e a senha estiver vazia, enviamos sem ela (no caso o back end ignora a atualização da senha)
      const dataToSend = { ...formData };
      if (editingUsuario && !dataToSend.senha) {
        delete dataToSend.senha;
      }

      if (editingUsuario) {
        await api.put(`/api/usuarios/${editingUsuario.id}`, dataToSend);
        alert('Usuário atualizado com sucesso!');
      } else {
        await api.post('/api/usuarios', dataToSend);
        alert('Usuário criado com sucesso!');
      }
      closeModal();
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário', error);
      alert(error.response?.data?.detail || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário permanentemente?')) {
      try {
        await api.delete(`/api/usuarios/${id}`);
        alert('Usuário deletado com sucesso!');
        fetchUsuarios();
      } catch (error) {
        console.error('Erro ao deletar usuário', error);
        alert('Erro ao deletar usuário');
      }
    }
  };

  if (loading) {
    return <div className="page-container"><div className="loading-state"><div className="loader"></div>Carregando Usuários...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Gerenciamento de Usuários</h2>
          <p>Administre quem tem acesso à plataforma.</p>
        </div>
        <button className="btn-primary" onClick={openModalForCreate}>
          + Novo Usuário
        </button>
      </div>

      <div className="table-container" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--gray-light)', paddingBottom: '1rem' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Nome</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Perfil</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário cadastrado.</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid var(--gray-light)' }}>
                  <td style={{ padding: '1rem' }}>{usuario.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{usuario.nome}</td>
                  <td style={{ padding: '1rem' }}>{usuario.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: usuario.perfil === 'admin' ? '#dbeafe' : '#f3f4f6',
                      color: usuario.perfil === 'admin' ? '#1e40af' : '#4b5563',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      backgroundColor: usuario.ativo ? '#d1fae5' : '#fee2e2',
                      color: usuario.ativo ? '#065f46' : '#991b1b'
                    }}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => openModalForEdit(usuario)} 
                      style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'var(--gray-light)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(usuario.id)}
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
            <h3>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nome Completo</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {editingUsuario ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha'}
                </label>
                <input required={!editingUsuario} type="password" name="senha" value={formData.senha} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Perfil de Acesso</label>
                <select name="perfil" value={formData.perfil} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="user">Usuário Comum (User)</option>
                  <option value="admin">Administrador (Admin)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="ativo" name="ativo" checked={formData.ativo} onChange={handleInputChange} />
                <label htmlFor="ativo" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Conta Ativa</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} style={{ padding: '0.75rem 1.5rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Salvar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
