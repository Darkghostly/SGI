import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Send } from 'lucide-react';

export const Communications: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '', url: '' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ text: '', type: '', url: '' });

    try {
      const res = await api.post('/email/send', { subject, message });
      setFeedback({ text: res.data.message, type: 'success', url: res.data.previewUrl });
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFeedback({ text: err.response?.data?.error || 'Erro ao enviar e-mails', type: 'error', url: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Mail size={32} color="var(--accent-primary)" />
        <h2>Comunicados</h2>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Enviar E-mail para Administradores</h3>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            A mensagem será enviada para o endereço de e-mail de todos os usuários registrados no sistema.
          </p>
        </div>

        {feedback.text && (
          <div style={{ padding: '16px', backgroundColor: feedback.type === 'error' ? 'var(--status-danger-bg)' : 'var(--status-success-bg)', color: feedback.type === 'error' ? 'var(--status-danger)' : 'var(--status-success)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600 }}>{feedback.text}</div>
            {feedback.url && (
              <div style={{ marginTop: '8px' }}>
                <a href={feedback.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Abrir visualização do E-mail (Ethereal)
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSend}>
          <div className="input-group">
            <label className="input-label">Assunto</label>
            <input 
              className="input-field" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Ex: Atualização do Sistema"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mensagem</label>
            <textarea 
              className="input-field" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Digite sua mensagem aqui..."
              rows={8}
              required 
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
            <Send size={18} />
            {loading ? 'Enviando...' : 'Enviar Comunicado'}
          </button>
        </form>
      </div>
    </div>
  );
};
