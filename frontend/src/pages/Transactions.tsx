import React, { useEffect, useState } from 'react';
import { getMovimentacoes, createMovimentacao, getProdutos } from '../api';
import type { Movimentacao, Produto } from '../api';
import { ArrowDownRight, ArrowUpRight, Plus, X } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [produtoId, setProdutoId] = useState('');
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  const loadData = async () => {
    try {
      const [movRes, prodRes] = await Promise.all([getMovimentacoes(), getProdutos()]);
      setMovimentacoes(movRes);
      setProdutos(prodRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = () => {
    setProdutoId('');
    setTipo('entrada');
    setQuantidade('');
    setObservacao('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMovimentacao({
        produtoId: parseInt(produtoId, 10),
        tipo,
        quantidade: parseInt(quantidade, 10),
        observacao,
      });
      closeModal();
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error registering transaction.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Transactions History</h2>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} />
          New Transaction
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Observation</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.slice().reverse().map(m => (
                <tr key={m.id}>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>{m.data}</td>
                  <td style={{ fontWeight: 500 }}>{m.nomeProduto}</td>
                  <td>
                    <span className={`badge ${m.tipo === 'entrada' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', gap: '4px' }}>
                      {m.tipo === 'entrada' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      {m.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: m.tipo === 'entrada' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                  </td>
                  <td className="text-muted">{m.observacao || '-'}</td>
                </tr>
              ))}
              {movimentacoes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No transactions found.
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Register Transaction</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Product</label>
                <select required className="input-field" value={produtoId} onChange={e => setProdutoId(e.target.value)}>
                  <option value="" disabled>Select a product...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (Stock: {p.quantidade})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select required className="input-field" value={tipo} onChange={e => setTipo(e.target.value as 'entrada' | 'saida')}>
                    <option value="entrada">Entrada (Inbound)</option>
                    <option value="saida">Saída (Outbound)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Quantity</label>
                  <input required className="input-field" type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Observation</label>
                <input className="input-field" type="text" value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="e.g. Replenishment, Sale, Damaged" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
