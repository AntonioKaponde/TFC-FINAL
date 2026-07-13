import { api } from './client';

export const artigosApi = {
  listar: (pesquisa) =>
    api.get(pesquisa ? `/api/artigos?pesquisa=${encodeURIComponent(pesquisa)}` : '/api/artigos'),
  criar: (data) => api.post('/api/artigos', data),
  remover: (id) => api.delete(`/api/artigos/${id}`),
};

export const clientesApi = {
  listar: (pesquisa) =>
    api.get(pesquisa ? `/api/clientes?pesquisa=${encodeURIComponent(pesquisa)}` : '/api/clientes'),
  criar: (data) => api.post('/api/clientes', data),
  remover: (id) => api.delete(`/api/clientes/${id}`),
};

export const fornecedoresApi = {
  listar: (pesquisa) =>
    api.get(
      pesquisa ? `/api/fornecedores?pesquisa=${encodeURIComponent(pesquisa)}` : '/api/fornecedores',
    ),
  criar: (data) => api.post('/api/fornecedores', data),
  /** Busca o fornecedor mais adequado para um produto pelo nome */
  buscarPorProduto: (nome) => api.get(`/api/fornecedores/por-produto?nome=${encodeURIComponent(nome)}`),
  remover: (id) => api.delete(`/api/fornecedores/${id}`),
};

export const faturasApi = {
  listar: () => api.get('/api/faturas'),
  criar: (data) => api.post('/api/faturas', data),
  marcarComoPaga: (id) => api.patch(`/api/faturas/${id}/pagar`),
  baixarPdf: (id, numero) => api.download(`/api/faturas/${id}/pdf`, `Fatura-${numero}.pdf`),
};

export const dashboardApi = {
  indicadores: (ano) =>
    api.get(ano ? `/api/dashboard/indicadores?ano=${ano}` : '/api/dashboard/indicadores'),
  comparativoMensal: (ano) =>
    api.get(
      ano ? `/api/dashboard/comparativo-mensal?ano=${ano}` : '/api/dashboard/comparativo-mensal',
    ),
  baixarRelatorioImpostosPdf: (ano) =>
    api.download(
      ano ? `/api/dashboard/relatorio-impostos/pdf?ano=${ano}` : '/api/dashboard/relatorio-impostos/pdf',
      `Relatorio_Impostos_${ano || new Date().getFullYear()}.pdf`,
    ),
};

export const configuracaoFiscalApi = {
  obter: () => api.get('/api/configuracao-fiscal'),
  salvar: (data) => api.put('/api/configuracao-fiscal', data),
};

export const notasCreditoApi = {
  listar: () => api.get('/api/notas-credito'),
  criar: (data) => api.post('/api/notas-credito', data),
};

export const categoriasApi = {
  listar: () => api.get('/api/categorias'),
  criar: (data) => api.post('/api/categorias', data),
  atualizar: (id, data) => api.put(`/api/categorias/${id}`, data),
  remover: (id) => api.delete(`/api/categorias/${id}`),
};

export const movimentosEstoqueApi = {
  listar: () => api.get('/api/movimentos-estoque'),
  criar: (data) => api.post('/api/movimentos-estoque', data),
  corrigirArtigos: () => api.post('/api/movimentos-estoque/corrigir-artigos'),
  recalcularIva: () => api.post('/api/movimentos-estoque/recalcular-iva'),
};

export const saftApi = {
  exportar: (ano, mes) =>
    api.download(`/api/saft/exportar?ano=${ano}&mes=${mes}`, `SAF-T_${ano}_${String(mes).padStart(2, '0')}.xml`),
};

export const usuariosApi = {
  listar: () => api.get('/api/usuarios'),
  criar: (data) => api.post('/api/usuarios', data),
  remover: (id) => api.delete(`/api/usuarios/${id}`),
};
