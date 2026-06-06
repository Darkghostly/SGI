import React, { useEffect, useState } from 'react';
import { getRelatorio } from '../api';
import type { Produto } from '../api';
import { Download, FileText } from 'lucide-react';

export const Reports: React.FC = () => {
  const [relatorio, setRelatorio] = useState<Produto[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRelatorio();
        setRelatorio(data);
      } catch (err) {
        console.error('Error fetching report', err);
      }
    };
    fetchData();
  }, []);

  const totalValue = relatorio.reduce((acc, p) => acc + parseFloat(p.valorTotal || '0'), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Categoria', 'Estoque', 'Preco Unitario', 'Validade', 'Valor Total'];
    const rows = relatorio.map(p => [
      p.id,
      `"${p.nome}"`,
      `"${p.categoria}"`,
      p.quantidade,
      p.preco,
      p.validade ? `"${new Date(p.validade).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}"` : '"Indeterminado"',
      p.valorTotal
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      <style>
        {`
          @media print {
            html, body, .app-container, .main-content {
              height: auto !important;
              overflow: visible !important;
              position: static !important;
            }
            body { background: white !important; color: black !important; }
            .sidebar, .btn { display: none !important; }
            .main-content { padding: 0 !important; }
            .card { border: none !important; box-shadow: none !important; background: transparent !important; }
            * { color: black !important; }
            th { border-bottom: 2px solid black !important; color: black !important; }
            td { border-bottom: 1px solid #ccc !important; }
            /* Ensure the page breaks nicely inside the table if it is long */
            tr { page-break-inside: avoid; }
          }
        `}
      </style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Inventory Reports</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="card" id="print-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <FileText size={32} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Full Inventory Report</h3>
            <div className="text-muted">Generated on {new Date().toLocaleString()}</div>
          </div>
        </div>

        <div className="table-container" style={{ marginBottom: '32px' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit Price</th>
                <th>Validade</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.map(p => (
                <tr key={p.id}>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>#{p.id}</td>
                  <td style={{ fontWeight: 500 }}>{p.nome}</td>
                  <td>{p.categoria}</td>
                  <td style={{ fontWeight: 600 }}>{p.quantidade}</td>
                  <td style={{ fontFamily: 'monospace' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco)}</td>
                  <td>{p.validade ? new Date(p.validade).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Indeterminado'}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(p.valorTotal || '0'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inventory Value</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
