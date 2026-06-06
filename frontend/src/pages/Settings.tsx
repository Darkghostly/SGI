import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, getUsuarios, updateUsuario, deleteUsuario, getMe, updateMe, type Usuario } from '../api';
import { Shield, Trash2, UserPlus, AlertTriangle, Edit2, X, Users } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [wipeConfirm, setWipeConfirm] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSenha, setEditSenha] = useState('');

  const [meNome, setMeNome] = useState('');
  const [meEmail, setMeEmail] = useState('');
  const [meSenha, setMeSenha] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const isDev = user?.role === 'DEV';

  const loadUsers = async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMe = async () => {
    try {
      const data = await getMe();
      setMeNome(data.nome);
      setMeEmail(data.email);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isDev) {
      loadUsers();
    } else {
      loadMe();
    }
  }, [isDev]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await api.post('/auth/register', { nome, email, senha });
      setMsg({ text: 'Administrador criado com sucesso!', type: 'success' });
      setNome(''); setEmail(''); setSenha('');
      loadUsers();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Erro ao criar', type: 'error' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUsuario(editingUser.id, { nome: editNome, email: editEmail, senha: editSenha });
      setMsg({ text: 'Usuário atualizado com sucesso!', type: 'success' });
      setIsEditModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Erro ao atualizar', type: 'error' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmId === null) return;
    try {
      await deleteUsuario(deleteConfirmId);
      setMsg({ text: 'Usuário excluído com sucesso!', type: 'success' });
      loadUsers();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Erro ao excluir', type: 'error' });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openEditModal = (u: Usuario) => {
    setEditingUser(u);
    setEditNome(u.nome);
    setEditEmail(u.email);
    setEditSenha('');
    setIsEditModalOpen(true);
  };

  const handleWipe = async () => {
    try {
      await api.delete('/admin/reset');
      setMsg({ text: 'Banco de dados zerado com sucesso.', type: 'success' });
      setWipeConfirm(false);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Erro ao zerar banco', type: 'error' });
    }
  };

  const handleUpdateMe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      await updateMe({ nome: meNome, email: meEmail, senha: meSenha });
      setMsg({ text: 'Perfil atualizado com sucesso!', type: 'success' });
      setMeSenha('');
    } catch (err: any) {
      setMsg({ text: err.response?.data?.error || 'Erro ao atualizar', type: 'error' });
    }
  };

  if (!isDev) {
    return (
      <div>
        <h2>Configurações do Perfil</h2>
        
        {msg.text && (
          <div style={{ padding: '12px', backgroundColor: msg.type === 'error' ? 'var(--status-danger-bg)' : 'var(--status-success-bg)', color: msg.type === 'error' ? 'var(--status-danger)' : 'var(--status-success)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.875rem' }}>
            {msg.text}
          </div>
        )}

        <div className="card" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Shield size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Meu Perfil</h3>
          </div>
          
          <form onSubmit={handleUpdateMe}>
            <div className="input-group">
              <label className="input-label">Nome</label>
              <input className="input-field" value={meNome} onChange={e => setMeNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input-field" type="email" value={meEmail} onChange={e => setMeEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Nova Senha (deixe em branco para manter a atual)</label>
              <input className="input-field" type="password" value={meSenha} onChange={e => setMeSenha(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Salvar Alterações</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Developer Settings</h2>

      {msg.text && (
        <div style={{ padding: '12px', backgroundColor: msg.type === 'error' ? 'var(--status-danger-bg)' : 'var(--status-success-bg)', color: msg.type === 'error' ? 'var(--status-danger)' : 'var(--status-success)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.875rem' }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <UserPlus size={24} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Adicionar Administrador</h3>
          </div>
          
          <form onSubmit={handleCreateAdmin}>
            <div className="input-group">
              <label className="input-label">Nome</label>
              <input className="input-field" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input-field" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Criar Conta</button>
          </form>
        </div>

        <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <AlertTriangle size={24} color="var(--status-danger)" />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--status-danger)' }}>Danger Zone</h3>
          </div>
          
          <div style={{ marginBottom: '16px', fontSize: '0.875rem' }}>
            Esta ação irá apagar <strong>todos os Produtos e Movimentações</strong> do sistema de forma irreversível. Os usuários cadastrados serão mantidos.
          </div>

          {!wipeConfirm ? (
            <button onClick={() => setWipeConfirm(true)} className="btn btn-danger" style={{ width: '100%' }}>
              <Trash2 size={16} /> Zerar Banco de Dados
            </button>
          ) : (
            <div style={{ padding: '16px', backgroundColor: 'var(--status-danger-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 600, color: 'var(--status-danger)', marginBottom: '12px' }}>Tem certeza absoluta?</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleWipe} className="btn btn-danger" style={{ flex: 1 }}>Sim, Apagar Tudo</button>
                <button onClick={() => setWipeConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Users size={24} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem' }}>Manage Administrators</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>#{u.id}</td>
                  <td style={{ fontWeight: 500 }}>{u.nome}</td>
                  <td>{u.email}</td>
                  <td><span className="badge" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>{u.role}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openEditModal(u)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDeleteUser(u.id)} disabled={u.role === 'DEV'}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsEditModalOpen(false)}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Editar Usuário</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdateUser}>
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input required className="input-field" type="text" value={editNome} onChange={e => setEditNome(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input required className="input-field" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Nova Senha (deixe em branco para manter a atual)</label>
                <input className="input-field" type="password" value={editSenha} onChange={e => setEditSenha(e.target.value)} placeholder="••••••••" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId !== null && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirmId(null)}>
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--status-danger-bg)', borderRadius: '50%' }}>
                <Trash2 size={32} color="var(--status-danger)" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Excluir Usuário</h3>
            <p className="text-muted" style={{ marginBottom: '24px' }}>Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDeleteUser}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
