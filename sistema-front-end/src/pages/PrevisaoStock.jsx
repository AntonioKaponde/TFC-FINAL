import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obterRoles } from '../utils/authStorage';
import {
  Box, Typography, Card, CardContent, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert, Tooltip, Paper, InputBase,
  IconButton, Button, Stack
} from '@mui/material';
import {
  Insights as InsightsIcon,
  Inventory2 as InventoryIcon,
  WarningAmber as AlertaIcon,
  Block as ParadoIcon,
  AddShoppingCart as ReporIcon,
  LocalShipping as ReposicaoIcon,
  Info as InfoIcon,
  WarningAmber as WarningAmberIcon,
  Search as SearchIcon,
  FilterAltOutlined as FilterAltOutlinedIcon,
  
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { previsaoStockApi } from '../api';

const STATUS = {
  A_ACABAR: { label: 'Vai acabar em breve', cor: 'error' },
  STOCK_BAIXO: { label: 'Stock baixo', cor: 'warning' },
  PARADO: { label: 'Parado', cor: 'default' },
  SEM_STOCK: { label: 'Sem stock', cor: 'error' },
  NORMAL: { label: 'Normal', cor: 'success' },
};

const VELOCIDADE = {
  ALTA: { label: 'Alta', cor: 'success' },
  MEDIA: { label: 'Média', cor: 'info' },
  BAIXA: { label: 'Baixa', cor: 'warning' },
  SEM_VENDAS: { label: 'Sem vendas', cor: 'default' },
};

const itensPorPagina = 7;

export default function PrevisaoStock() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [paginaAtual, setPaginaAtual] = useState(0);

  // Apenas Admin e Gerente podem visualizar a previsão de stock.
  useEffect(() => {
    const userRoles = obterRoles();
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
    const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');

    if (isOperador || isContabilista) {
      navigate('/faturacao');
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        const data = await previsaoStockApi.previsao();
        setDados(data);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar a previsão de stock.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [navigate]);

  // Repõe a página ao alterar pesquisa ou filtros
  useEffect(() => {
    setPaginaAtual(0);
  }, [pesquisa, filtroEstado]);

  if (loading) {
    return (
      <div>
        <NavBar />
        <Box sx={{ display: 'flex' }}>
          <SideBar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, md: 4 },
              mt: '70px',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh'
            }}
          >
            <CircularProgress size={40} sx={{ color: '#083927' }} />
          </Box>
        </Box>
      </div>
    );
  }

  const resumo = dados?.resumo;

  const cards = [
    { icon: <InventoryIcon sx={{ fontSize: '2rem' }}/>, label: 'Total de produtos', valor: resumo?.totalArtigos ?? 0, cor: '#083927' },
    { icon: <AlertaIcon sx={{ fontSize: '2rem' }}/>, label: 'Vão acabar em breve', valor: resumo?.aAcabar ?? 0, cor: '#EF4444' },
    
    { icon: <ParadoIcon sx={{ fontSize: '2rem' }}/>, label: 'Produtos parados', valor: resumo?.parados ?? 0, cor: '#64748B' },
    { icon: <ReporIcon sx={{ fontSize: '2rem' }}/>, label: 'Com sugestão de reposição', valor: resumo?.comSugestaoReposicao ?? 0, cor: '#22C55E' },
  ];

  const artigos = dados?.artigos || [];
  const artigosFiltrados = artigos.filter((a) => {
    const q = pesquisa.toLowerCase();
    const matchPesquisa =
      !q ||
      a.nome.toLowerCase().includes(q) ||
      (a.sku || "").toLowerCase().includes(q) ||
      (a.categoria || "").toLowerCase().includes(q);

    const matchEstado = filtroEstado === "TODOS" || a.status === filtroEstado;
    return matchPesquisa && matchEstado;
  });
  const totalPaginas = Math.ceil(artigosFiltrados.length / itensPorPagina);
  // Garante que a página nunca ultrapasse os dados disponíveis após alterações
  const startIndex = Math.min(paginaAtual * itensPorPagina, Math.max(0, artigosFiltrados.length - itensPorPagina));
  const artigosPaginados = artigosFiltrados.slice(startIndex, startIndex + itensPorPagina);

  return (
    <div>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: { xs: 2, md: 4 },
            mt: '70px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            {/*<InsightsIcon sx={{ color: '#083927', fontSize: 32 }} />*/}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Previsão de Stock</Typography>
              <Typography variant="caption" color="textSecondary">
                Velocidade de venda, dias restantes e sugestões de reposição com base nos últimos 90 dias.
              </Typography>
            </Box>
          </Box>

          {erro && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{erro}</Alert>}

          {dados && (
            <>
              {/* Resumo */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 2,
                  mb: 3
                }}
              >
                {cards.map((c) => (
                  <Card key={c.label} sx={{ width: "100%", p: 5, minHeight: "10rem", borderRadius: 3}}>
                    <Box sx={{display:"flex",justifyContent:"space-between"}}>
                      <Typography variant="caption" color="textSecondary" sx={{fontSize: '1rem', color: '#64748b'}}>{c.label}</Typography>
                      <Box sx={{ color: c.cor}}>{c.icon}</Box>
                    </Box>
                    <Box>
                      
                    </Box>
                    <h2>{c.valor}</h2>
                  </Card>
                ))}
              </Box>
              {/* Tabela */}
              <Card sx={{ maxWidth: 2000 }}>
                <TableContainer sx={{ maxHeight: { xs: '70vh', md: '62vh' }, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                      <TableRow>
                        {['Produto', 'Categoria', 'Stock atual', 'Consumo/mês', 'Dias restantes', 'Última venda', 'Velocidade', 'Estado', 'Repor (sugestão)'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem",bgcolor:"#F1F5F9" }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {artigos.length === 0 ? (
                        <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">Sem artigos registados.</Typography>
                        </TableCell></TableRow>
                      ) : artigosPaginados.length === 0 ? (
                        <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">Nenhum artigo encontrado com os filtros atuais.</Typography>
                        </TableCell></TableRow>
                      ) : (
                        artigosPaginados.map((a) => (
                          <TableRow key={a.id} hover sx={{ bgcolor: a.status === 'A_ACABAR' ? '#FFF7F7' : a.status === 'PARADO' ? '#FAFAFA' : 'inherit' }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{a.nome}</Typography>
                              <Typography variant="caption" sx={{ color: '#94A3B8' }}>{a.sku}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.83rem', color: '#475569' }}>{a.categoria || '—'}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: a.stockAtual <= (a.stockMinimo || 0) ? '#DC2626' : '#0F172A' }}>
                                {a.stockAtual} <Typography component="span" variant="caption" sx={{ color: '#94A3B8' }}>min {a.stockMinimo}</Typography>
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.83rem' }}>{Number(a.consumoMensal) > 0 ? `${Number(a.consumoMensal).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} un/mês` : '—'}</TableCell>
                            <TableCell>
                              {a.diasRestantes != null ? (
                                <Chip
                                  size="small"
                                  label={`${a.diasRestantes} dias`}
                                  color={a.diasRestantes <= 15 ? 'error' : a.diasRestantes <= 30 ? 'warning' : 'success'}
                                  sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                                />
                              ) : (
                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>—</Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.83rem', color: '#475569' }}>
                              {a.ultimaVenda ? new Date(a.ultimaVenda).toLocaleDateString('pt-PT') : 'Sem vendas'}
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={VELOCIDADE[a.velocidade]?.label || a.velocidade}
                                color={VELOCIDADE[a.velocidade]?.cor || 'default'} sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={STATUS[a.status]?.label || a.status}
                                color={STATUS[a.status]?.cor || 'default'} sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
                            </TableCell>
                            <TableCell>
                              {a.sugestaoReposicao > 0 ? (
                                <Tooltip title="Cobertura de ~45 dias de consumo">
                                  <Chip size="small" label={`+${a.sugestaoReposicao} un`}
                                    sx={{ fontWeight: 700, fontSize: 11, height: 22, bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Paginação */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #f1f5f9",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    A mostrar {artigosFiltrados.length > 0 ? startIndex + 1 : 0} a{" "}
                    {Math.min(startIndex + itensPorPagina, artigosFiltrados.length)} de{" "}
                    {artigosFiltrados.length} artigo(s)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
                      disabled={paginaAtual === 0}
                      sx={{ textTransform: "none" }}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setPaginaAtual((p) => Math.min(totalPaginas - 1, p + 1))}
                      disabled={paginaAtual >= totalPaginas - 1 || totalPaginas === 0}
                      sx={{ textTransform: "none" }}
                    >
                      Próximo
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
