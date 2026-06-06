import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  preco: number;
  validade?: string;
  criadoEm?: string;
  valorTotal?: string; // from relatorio
  estoqueZero?: boolean; // from relatorio
}

export interface Movimentacao {
  id: number;
  produtoId: number;
  nomeProduto?: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  observacao: string;
  data: string;
}

export const getProdutos = async () => {
  const { data } = await api.get<Produto[]>('/produtos');
  return data;
};

export const createProduto = async (produto: Partial<Produto>) => {
  const { data } = await api.post<Produto>('/produtos', produto);
  return data;
};

export const updateProduto = async (id: number, produto: Partial<Produto>) => {
  const { data } = await api.put<Produto>(`/produtos/${id}`, produto);
  return data;
};

export const deleteProduto = async (id: number) => {
  const { data } = await api.delete(`/produtos/${id}`);
  return data;
};

export const getMovimentacoes = async () => {
  const { data } = await api.get<Movimentacao[]>('/movimentacoes');
  return data;
};

export const createMovimentacao = async (mov: Partial<Movimentacao>) => {
  const { data } = await api.post<Movimentacao>('/movimentacoes', mov);
  return data;
};

export const getRelatorio = async (): Promise<Produto[]> => {
  const response = await api.get('/relatorio');
  return response.data;
};

export const getEvolucao = async (filtro: string, categoria: string): Promise<{ date: string; units: number; value: number }[]> => {
  const response = await api.get('/dashboard/evolucao', { params: { filtro, categoria } });
  return response.data;
};

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export const getUsuarios = async () => {
  const { data } = await api.get<Usuario[]>('/admin/users');
  return data;
};

export const updateUsuario = async (id: number, payload: any) => {
  const { data } = await api.put<Usuario>(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUsuario = async (id: number) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get<Usuario>('/users/me');
  return data;
};

export const updateMe = async (payload: any) => {
  const { data } = await api.put<Usuario>('/users/me', payload);
  return data;
};
