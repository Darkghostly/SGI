import React, { useEffect, useState } from 'react';
import { getRelatorio, getMovimentacoes, getEvolucao } from '../api';
import type { Produto, Movimentacao } from '../api';
import { Package, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export const Dashboard: React.FC = () => {
  const [relatorio, setRelatorio] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [evolucao, setEvolucao] = useState<{ date: string; units: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState('tudo');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [relRes, movRes] = await Promise.all([getRelatorio(), getMovimentacoes()]);
        setRelatorio(relRes);
        setMovimentacoes(movRes);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchEvolucao = async () => {
      try {
        const evoRes = await getEvolucao(filtroTempo, filtroCategoria);
        setEvolucao(evoRes);
      } catch (err) {
        console.error('Error fetching evolution data', err);
      }
    };
    fetchEvolucao();
  }, [filtroTempo, filtroCategoria]);

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  const totalProdutos = relatorio.length;
  const unidades = relatorio.reduce((acc, p) => acc + p.quantidade, 0);
  const valorTotal = relatorio.reduce((acc, p) => acc + parseFloat(p.valorTotal || '0'), 0);
  const estoqueZero = relatorio.filter(p => p.estoqueZero).length;
  const produtosCriticos = relatorio.filter(p => p.quantidade <= 3).sort((a, b) => a.quantidade - b.quantidade);

  // Chart Data
  const categoriasMap: Record<string, number> = {};
  relatorio.forEach(p => {
    categoriasMap[p.categoria] = (categoriasMap[p.categoria] || 0) + p.quantidade;
  });



  const lineChartData = {
    labels: evolucao.map(e => e.date),
    datasets: [
      {
        label: 'Total Units',
        data: evolucao.map(e => e.units),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: 'Total Value (R$)',
        data: evolucao.map(e => e.value),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        yAxisID: 'y1',
        tension: 0.3
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { position: 'top' as const } },
    scales: {
      x: { grid: { display: false } },
      y: { type: 'linear' as const, display: true, position: 'left' as const, grid: { color: 'rgba(255,255,255,0.05)' } },
      y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false } }
    }
  };

  return (
    <div>
      <h2>Dashboard Overview</h2>
      
      <div className="grid-cards">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
              <Package size={24} color="#3B82F6" />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Items</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalProdutos}</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <DollarSign size={24} color="#10B981" />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Inventory Value</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
              <TrendingUp size={24} color="#F59E0B" />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Units</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{unidades}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: estoqueZero > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <AlertCircle size={24} color={estoqueZero > 0 ? '#EF4444' : '#10B981'} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>Zero Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: estoqueZero > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>{estoqueZero}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Stock Evolution</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="input-field" style={{ padding: '6px 12px' }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                <option value="Todas">Todas as Categorias</option>
                {Object.keys(categoriasMap).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input-field" style={{ padding: '6px 12px' }} value={filtroTempo} onChange={e => setFiltroTempo(e.target.value)}>
                <option value="tudo">Todo o Período</option>
                <option value="ano">Último Ano</option>
                <option value="semestre">Último Semestre</option>
                <option value="bimestre">Último Bimestre</option>
                <option value="mês">Último Mês</option>
              </select>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: 600 }}>Critical Stock</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {produtosCriticos.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.nome}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.categoria}</div>
                  </div>
                  <span className={`badge ${p.quantidade === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {p.quantidade} un.
                  </span>
                </div>
              ))}
              {produtosCriticos.length === 0 && <div className="text-muted" style={{ fontSize: '0.875rem' }}>No critical products.</div>}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: 600 }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {movimentacoes.slice().reverse().slice(0, 5).map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ marginTop: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: m.tipo === 'entrada' ? 'var(--status-success)' : 'var(--status-danger)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 600, color: m.tipo === 'entrada' ? 'var(--status-success)' : 'var(--status-danger)' }}>
                        {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                      </span>{' '}
                      un. of <span style={{ fontWeight: 600 }}>{m.nomeProduto}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{m.data}</div>
                  </div>
                </div>
              ))}
              {movimentacoes.length === 0 && <div className="text-muted" style={{ fontSize: '0.875rem' }}>No recent activity.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
