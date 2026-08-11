import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obterRoles } from '../utils/authStorage';
import {
  Box, Typography, Card, Grid, CircularProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Stack, Alert, Tooltip, Paper, Divider
} from '@mui/material';
import {
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  EventAvailable as ObrigacoesIcon,
  History as HistoryIcon,
  WarningAmber as AlertaIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { inteligenciaFiscalApi } from '../api';
import { formatKzSemPrefixo } from '../utils/formatters';

const STATUS_OBRIGACAO = {
  VENCIDA: { label: 'Vencida', cor: 'error' },
  'PRÓXIMA': { label: 'Próxima', cor: 'warning' },
  EM_DIA: { label: 'Em dia', cor: 'info' },
  PROGRAMADA: { label: 'Programada', cor: 'success' },
};

export default function InteligenciaFiscal() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Apenas Admin, Contabilista e Gerente podem visualizar a Inteligência Fiscal.
  useEffect(() => {
    const userRoles = obterRoles();
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
    const isGestorEstoque = userRoles.some(r => r.toUpperCase() === 'GERENTE' || r.toUpperCase() === 'GERENTE DE ESTOQUE');

    if (isOperador || isGestorEstoque) {
      navigate('/faturacao');
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        const data = await inteligenciaFiscalApi.previsao();
        setDados(data);
      } catch (e) {
        setErro(e.message || 'Erro ao carregar a previsão fiscal.');
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

  const variacaoLabel = dados?.variacaoIvaPercentual != null
    ? `${dados.variacaoIvaPercentual > 0 ? '+' : ''}${Number(dados.variacaoIvaPercentual).toLocaleString('pt-PT')}%`
    : '—';

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
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Inteligência Fiscal</Typography>
              <Typography variant="caption" color="textSecondary">
                Previsão de obrigações tributárias, IVA estimado e comparação entre períodos.
              </Typography>
            </Box>
          </Box>

          {erro && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{erro}</Alert>}

          {dados && (
            <>
              {/* Previsão */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))"
                  },
                  gap: 2,
                  width: "100%",
                  mb: 3
                }}
              >
                <Box>
                  <Card sx={{ width: "100%", p: 2, minHeight: "10rem", borderRadius: 3, bgcolor: '#083927', color: '#fff' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography sx={{ fontSize: '0.95rem', color: '#ffffffcc', fontWeight: 600 }}>
                        Estimativa de IVA
                      </Typography>
                      <InsightsIcon sx={{ fontSize: '2rem', color: '#ffffffcc' }} />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <h2 style={{ margin: 0, color: '#fff' }}>
                        {formatKzSemPrefixo(dados.previsaoIva)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff99' }}>Kz</span>
                      </h2>
                      <Typography variant="caption" sx={{ color: '#ffffff99', display: 'block', mt: 1 }}>
                        {dados.periodoPrevisao?.toUpperCase()} · com base nas vendas recentes
                      </Typography>
                    </Box>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ width: "100%", p: 2, minHeight: "10rem", borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                        Previsão Faturação
                      </Typography>
                      <TrendingUpIcon sx={{ fontSize: '2rem', color: '#64748b' }} />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <h2 style={{ margin: 0, color: '#111', wordBreak: 'break-word' }}>
                        {formatKzSemPrefixo(dados.previsaoFaturacao)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Kz</span>
                      </h2>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        Projeção com base no histórico de vendas
                      </Typography>
                    </Box>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ width: "100%", p: 2, minHeight: "10rem", borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                        IVA Último Mês
                      </Typography>
                      <HistoryIcon sx={{ fontSize: '2rem', color: '#64748b' }} />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <h2 style={{ margin: 0, color: '#111' }}>
                        {formatKzSemPrefixo(dados.ivaUltimoMes)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>Kz</span>
                      </h2>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: Number(dados.variacaoIvaPercentual) >= 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                        {variacaoLabel} vs mês anterior
                      </Typography>
                    </Box>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ width: "100%", p: 2, minHeight: "10rem", borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography sx={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                        Comparação Anual
                      </Typography>
                      <ObrigacoesIcon sx={{ fontSize: '2rem', color: '#64748b' }} />
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <h2 style={{ margin: 0, color: '#111' }}>
                        {dados.comparacaoAnoAnterior?.variacaoPercentual != null
                          ? `${dados.comparacaoAnoAnterior.variacaoPercentual > 0 ? '+' : ''}${Number(dados.comparacaoAnoAnterior.variacaoPercentual).toLocaleString('pt-PT')}%`
                          : '—'}
                      </h2>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                        YTD vs ano anterior ({formatKzSemPrefixo(dados.comparacaoAnoAnterior?.faturacaoAnoAnterior)} Kz)
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Box>

              {/* Obrigações */}
              <Card variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, md: 4 }, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AlertaIcon sx={{ color: '#EAB308' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>Obrigações fiscais próximas</Typography>
                </Box>
                <Grid container spacing={2}>
                  {dados.obrigacoes?.map((o, i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: o.status === 'VENCIDA' ? '#FCA5A5' : '#E2E8F0', bgcolor: o.status === 'VENCIDA' ? '#FEF2F2' : '#fff' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>{o.descricao}</Typography>
                          <Chip size="small" label={STATUS_OBRIGACAO[o.status]?.label || o.status}
                            color={STATUS_OBRIGACAO[o.status]?.cor || 'default'} sx={{ fontWeight: 700, fontSize: 10, height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                          Período: {o.periodoReferencia}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A', mt: 0.5 }}>
                          {o.dataLimite ? new Date(o.dataLimite).toLocaleDateString('pt-PT') : '—'}
                          {o.diasRestantes !== undefined && (
                            <Typography component="span" variant="caption" sx={{ ml: 1, color: o.diasRestantes < 0 ? '#DC2626' : '#64748B' }}>
                              ({o.diasRestantes < 0 ? `${Math.abs(o.diasRestantes)} dias em atraso` : `${o.diasRestantes} dias restantes`})
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>{o.detalhe}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Card>
              <Box sx={{ width: '100%' }}>
                {/* Histórico */}
                  <Card variant="outlined" sx={{ borderRadius: 3, width: '100%' }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>Histórico de impostos do ano</Typography>
                      <Typography variant="caption" color="textSecondary">IVA liquidado vs IVA dedutível e IVA a entregar por mês</Typography>
                    </Box>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 700 }}>
                        <TableHead>
                          <TableRow>
                            {['Mês', 'Faturação (Kz)', 'IVA liquidado (Kz)', 'IVA dedutível (Kz)', 'IVA a entregar (Kz)'].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: 600, bgcolor: '#f8f9fa', color: '#334155', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dados.historico?.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography color="textSecondary">Sem faturação registada no ano corrente.</Typography>
                            </TableCell></TableRow>
                          )}
                          {dados.historico?.map((h) => (
                            <TableRow key={`${h.ano}-${h.mes}`} hover>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.83rem' }}>{h.mes} {h.ano}</TableCell>
                              <TableCell sx={{ fontSize: '0.83rem' }}>{formatKzSemPrefixo(h.faturacao)}</TableCell>
                              <TableCell sx={{ fontSize: '0.83rem' }}>{formatKzSemPrefixo(h.ivaLiquidado)}</TableCell>
                              <TableCell sx={{ fontSize: '0.83rem' }}>{formatKzSemPrefixo(h.ivaDedutivel)}</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: '0.83rem', color: Number(h.ivaEntregar) > 0 ? '#083927' : '#94A3B8' }}>
                                {formatKzSemPrefixo(h.ivaEntregar)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
