import React, { useEffect, useState } from 'react';
import { getProdutos, createProduto, updateProduto, deleteProduto } from '../api';
import type { Produto } from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const Products: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Form State
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [validade, setValidade] = useState('');
  const [isIndeterminado, setIsIndeterminado] = useState(true);

  const loadProdutos = async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const openModal = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setNome(produto.nome);
      setCategoria(produto.categoria);
      setQuantidade(produto.quantidade.toString());
      setPreco(produto.preco.toString());
      if (produto.validade) {
        setValidade(produto.validade);
        setIsIndeterminado(false);
      } else {
        setValidade('');
        setIsIndeterminado(true);
      }
    } else {
      setEditingProduto(null);
      setNome('');
      setCategoria('');
      setQuantidade('');
      setPreco('');
      setValidade('');
      setIsIndeterminado(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Produto> = {
        nome,
        categoria,
        quantidade: parseInt(quantidade, 10),
        preco: parseFloat(preco),
        validade: isIndeterminado ? '' : validade,
      };

      if (editingProduto) {
        await updateProduto(editingProduto.id, payload);
      } else {
        await createProduto(payload);
      }
      closeModal();
      loadProdutos();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    try {
      await deleteProduto(deleteConfirmId);
      loadProdutos();
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Inventory Products</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Validade</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map(p => (
                <tr key={p.id}>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>#{p.id}</td>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td><span className="badge" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>{p.categoria}</span></td>
                  <td style={{ fontWeight: 600, color: p.quantidade === 0 ? 'var(--status-danger)' : p.quantidade <= 3 ? 'var(--status-warning)' : 'var(--text-main)' }}>{p.quantidade}</td>
                  <td style={{ fontFamily: 'monospace' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}</td>
                  <td>{p.validade ? new Date(p.validade).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Indeterminado'}</td>
                  <td>
                    <span className={`badge ${p.quantidade === 0 ? 'badge-danger' : p.quantidade <= 3 ? 'badge-warning' : 'badge-success'}`}>
                      {p.quantidade === 0 ? 'Zero Stock' : p.quantidade <= 3 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => openModal(p)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => handleDelete(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingProduto ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Product Name</label>
                  <input required className="input-field" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="e.g. Dell XPS 15" />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input required className="input-field" type="text" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="e.g. Laptops" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Initial Stock</label>
                  <input required className="input-field" type="number" min="0" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" />
                </div>
                <div className="input-group">
                  <label className="input-label">Unit Price (R$)</label>
                  <input required className="input-field" type="number" step="0.01" min="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Validade
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isIndeterminado} 
                        onChange={(e) => {
                          setIsIndeterminado(e.target.checked);
                          if (e.target.checked) setValidade('');
                        }} 
                      />
                      Indeterminado
                    </label>
                  </label>
                  <input 
                    required={!isIndeterminado}
                    disabled={isIndeterminado}
                    className="input-field" 
                    type="date" 
                    value={validade} 
                    onChange={e => setValidade(e.target.value)} 
                    style={{ opacity: isIndeterminado ? 0.5 : 1 }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduto ? 'Save Changes' : 'Create Product'}</button>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Excluir Produto</h3>
            <p className="text-muted" style={{ marginBottom: '24px' }}>Tem certeza que deseja excluir este produto do estoque? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
