import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obterRoles } from '../utils/authStorage';
import {
  Box, Typography, Card, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert, Tooltip
} from '@mui/material';
import {
  Insights as InsightsIcon,
  Inventory2 as InventoryIcon,
  WarningAmber as AlertaIcon,
  Block as ParadoIcon,
  AddShoppingCart as ReporIcon,
  LocalShipping as ReposicaoIcon,
  Info as InfoIcon,
  WarningAmber as WarningAmberIcon
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

export default function PrevisaoStock() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Apenas Admin e Gerente de estoque podem visualizar a previsão de stock.
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
    { icon: <InventoryIcon />, label: 'Total de produtos', valor: resumo?.totalArtigos ?? 0, cor: '#083927' },
    { icon: <AlertaIcon />, label: 'Vão acabar em breve', valor: resumo?.aAcabar ?? 0, cor: '#EF4444' },
    
    { icon: <ParadoIcon />, label: 'Produtos parados', valor: resumo?.parados ?? 0, cor: '#64748B' },
    { icon: <ReporIcon />, label: 'Com sugestão de reposição', valor: resumo?.comSugestaoReposicao ?? 0, cor: '#22C55E' },
  ];

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
                  <Card variant="outlined" key={c.label} sx={{ borderRadius: 3, p: 2.5 }}>
                    <Box sx={{ color: c.cor, mb: 1 }}>{c.icon}</Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: c.cor }}>{c.valor}</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>{c.label}</Typography>
                  </Card>
                ))}
              </Box>

              {/*<Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} icon={<InfoIcon />}>
                Consumo médio mensal calculado a partir das vendas dos últimos 90 dias. Reposição sugerida cobre ~45 dias de consumo.
              </Alert>*/}

              {/* Tabela */}
              <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <TableContainer sx={{ maxHeight: { xs: '70vh', md: '62vh' }, overflowX: 'auto' }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        {['Produto', 'Categoria', 'Stock atual', 'Consumo/mês', 'Dias restantes', 'Última venda', 'Velocidade', 'Estado', 'Repor (sugestão)'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600, bgcolor: '#f8f9fa', color: '#334155', fontSize: '0.78rem',height: '75px' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dados.artigos?.length === 0 && (
                        <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">Sem artigos registados.</Typography>
                        </TableCell></TableRow>
                      )}
                      {dados.artigos?.map((a) => (
                        <TableRow key={a.id} hover sx={{ bgcolor: a.status === 'A_ACABAR' ? '#FFF7F7' : a.status === 'PARADO' ? '#FAFAFA' : 'inherit' }}>
                          <TableCell sx={{height: '75px' }}>
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
                                <Chip size="small" icon={<ReposicaoIcon />} label={`+${a.sugestaoReposicao} un`}
                                  sx={{ fontWeight: 700, fontSize: 11, height: 22, bgcolor: '#E8F5E9', color: '#2E7D32' }} />
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#94A3B8' }}>—</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
