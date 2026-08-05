import React, { useState, useEffect } from 'react';
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
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F7F9' }}>
        <CircularProgress size={40} sx={{ color: '#083927' }} />
      </Box>
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
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, mt: 10, ml: { md: 6 }, mr: { md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <InsightsIcon sx={{ color: '#083927', fontSize: 32 }} />
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
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ borderRadius: 3, p: 3, bgcolor: '#083927', color: '#fff' }}>
                    <Typography variant="caption" sx={{ color: '#ffffff88', fontWeight: 600 }}>
                      ESTIMATIVA DE IVA — {dados.periodoPrevisao?.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                      {formatKzSemPrefixo(dados.previsaoIva)} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Kz</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#ffffff99', display: 'block', mt: 1 }}>
                      Com base nas vendas dos últimos períodos.
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3, height: '100%' }}>
                    <TrendingUpIcon sx={{ color: '#083927', mb: 1 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>PREVISÃO FATURAÇÃO</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{formatKzSemPrefixo(dados.previsaoFaturacao)} Kz</Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3, height: '100%' }}>
                    <HistoryIcon sx={{ color: '#083927', mb: 1 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>IVA ÚLTIMO MÊS</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>{formatKzSemPrefixo(dados.ivaUltimoMes)} Kz</Typography>
                    <Typography variant="caption" sx={{ color: Number(dados.variacaoIvaPercentual) >= 0 ? '#22C55E' : '#EF4444', fontWeight: 700 }}>
                      {variacaoLabel} vs mês anterior
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3, height: '100%' }}>
                    <ObrigacoesIcon sx={{ color: '#083927', mb: 1 }} />
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>COMPARAÇÃO ANUAL</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {dados.comparacaoAnoAnterior?.variacaoPercentual != null
                        ? `${dados.comparacaoAnoAnterior.variacaoPercentual > 0 ? '+' : ''}${Number(dados.comparacaoAnoAnterior.variacaoPercentual).toLocaleString('pt-PT')}%`
                        : '—'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      YTD vs ano anterior ({formatKzSemPrefixo(dados.comparacaoAnoAnterior?.faturacaoAnoAnterior)} Kz)
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Obrigações */}
              <Card variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 3 }}>
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

              <Grid container spacing={3}>
                {/* Histórico */}
                <Grid item xs={12} md={8}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>Histórico de impostos do ano</Typography>
                      <Typography variant="caption" color="textSecondary">IVA liquidado vs IVA dedutível e IVA a entregar por mês</Typography>
                    </Box>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Mês', 'Faturação (Kz)', 'IVA liquidado (Kz)', 'IVA dedutível (Kz)', 'IVA a entregar (Kz)'].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: 600, bgcolor: '#f8f9fa', color: '#334155', fontSize: '0.78rem' }}>{h}</TableCell>
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
                </Grid>

                {/* IRT */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>IRT — Retenção na fonte</Typography>
                    {dados.irt?.aplicavel ? (
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#083927' }}>
                        {formatKzSemPrefixo(dados.irt.irtAcumulado)} Kz
                      </Typography>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                        {dados.irt?.observacao}
                      </Alert>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      O cálculo acumulado de IRT é apresentado quando existirem dados de retenção registados.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
}
