import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, Chip, TextField, InputAdornment, Grid,
  FormControl, InputLabel, Select, MenuItem, Stack, Button, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Tooltip, Paper, Divider, Snackbar, Alert
} from '@mui/material';
import {
  SupportAgent as SupportIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Close as CloseIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { pedidosSuporteApi } from '../api';
import { useNotificacoes } from '../context/NotificacoesContext';

const CATEGORIAS = {
  PROBLEMA_TECNICO: 'Problema técnico',
  ERRO_SISTEMA: 'Erro no sistema',
  DUVIDA_UTILIZACAO: 'Dúvida de utilização',
  SOLICITACAO_MELHORIA: 'Solicitação de melhoria',
};

const PRIORIDADES = {
  BAIXA: { label: 'Baixa', cor: 'default' },
  MEDIA: { label: 'Média', cor: 'info' },
  ALTA: { label: 'Alta', cor: 'warning' },
  CRITICA: { label: 'Crítica', cor: 'error' },
};

const ESTADOS = {
  ABERTO: { label: 'Aberto', cor: 'info' },
  EM_ANALISE: { label: 'Em análise', cor: 'warning' },
  EM_ATENDIMENTO: { label: 'Em atendimento', cor: 'primary' },
  RESOLVIDO: { label: 'Resolvido', cor: 'success' },
  FECHADO: { label: 'Fechado', cor: 'default' },
  CANCELADO: { label: 'Cancelado', cor: 'error' },
};

export default function GestaoSuporte() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [detalhe, setDetalhe] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [preview, setPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { limpar } = useNotificacoes();

  const showMessage = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pedidosSuporteApi.listar(filtroEstado || undefined);
      setPedidos(data);
    } catch (e) {
      showMessage(e.message || 'Erro ao carregar pedidos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  useEffect(() => { carregar(); }, [carregar]);

  // Ao abrir a gestão, marca os pedidos como visualizados (limpa o badge)
  useEffect(() => { limpar(); }, [limpar]);

  const filtrar = (estado) => { setFiltroEstado(estado === 'TODOS' ? '' : estado); };

  const filtrados = pedidos.filter((p) => {
    const q = pesquisa.toLowerCase();
    return (
      !q ||
      p.assunto.toLowerCase().includes(q) ||
      p.nomeUtilizador.toLowerCase().includes(q) ||
      p.emailUtilizador.toLowerCase().includes(q) ||
      (p.codigo || '').toLowerCase().includes(q)
    );
  });

  const abrirDetalhe = (pedido) => {
    setDetalhe(pedido);
    setObservacao(pedido.observacao || '');
  };

  const mudarEstado = async (id, estado) => {
    try {
      await pedidosSuporteApi.atualizarEstado(id, { estado });
      showMessage('Estado atualizado com sucesso!');
      carregar();
      if (detalhe && detalhe.id === id) {
        setDetalhe({ ...detalhe, estado });
      }
    } catch (e) {
      showMessage(e.message || 'Erro ao atualizar o estado.', 'error');
    }
  };

  const guardarObservacao = async () => {
    if (!detalhe) return;
    try {
      await pedidosSuporteApi.atualizarEstado(detalhe.id, { estado: detalhe.estado, observacao });
      showMessage('Resposta registada com sucesso!');
      setDetalhe(null);
      carregar();
    } catch (e) {
      showMessage(e.message || 'Erro ao guardar a resposta.', 'error');
    }
  };

  const verAnexo = async (anexo) => {
    try {
      const { blob } = await pedidosSuporteApi.obterAnexoBlob(anexo.id);
      setPreview({ nome: anexo.nomeOriginal, url: URL.createObjectURL(blob) });
    } catch {
      showMessage('Não foi possível visualizar o anexo.', 'error');
    }
  };

  const fecharPreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const ehImagem = (anexo) => (anexo.tipoConteudo || '').startsWith('image/');

  const totalAbertos = pedidos.filter((p) => p.estado === 'ABERTO' || p.estado === 'EM_ANALISE' || p.estado === 'EM_ATENDIMENTO').length;
  const totalCriticos = pedidos.filter((p) => p.prioridade === 'CRITICA' && p.estado !== 'RESOLVIDO' && p.estado !== 'FECHADO' && p.estado !== 'CANCELADO').length;
  const totalResolvidos = pedidos.filter((p) => p.estado === 'RESOLVIDO').length;

  return (
    <div>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, mt: 10, ml: { md: 6 }, mr: { md: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* <SupportIcon sx={{ color: '#083927', fontSize: 32 }} /> */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Gestão de Pedidos de Suporte</Typography>
                <Typography variant="caption" color="textSecondary">
                  {pedidos.length} pedidos · {totalAbertos} em aberto
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{mr:7}}>
              <Button size="small" startIcon={<RefreshIcon />} onClick={carregar} sx={{ textTransform: 'none' }}>Atualizar</Button>
              <TextField
                size="small" placeholder="Pesquisar pedidos..." value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  sx: { borderRadius: 2, bgcolor: '#fff', minWidth: 240 }
                }}
              />
            </Stack>
          </Box>

          {/* Resumo */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total de pedidos', valor: pedidos.length, cor: '#083927' },
              { label: 'Em aberto (análise/atendimento)', valor: totalAbertos, cor: '#EAB308' },
              { label: 'Prioridade crítica', valor: totalCriticos, cor: '#EF4444' },
              { label: 'Resolvidos', valor: totalResolvidos, cor: '#22C55E' },
            ].map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Card variant="outlined" sx={{ borderRadius: 2, p: 2.5,width: '20rem'}}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: s.cor }}>{s.valor}</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600,color: '#64748b',}}>{s.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filtro por estado */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/*<FilterIcon sx={{ color: '#64748b' }} />*/}
            {['TODOS', ...Object.keys(ESTADOS)].map((estado) => (
              <Button
                key={estado} size="small"
                variant={filtroEstado === (estado === 'TODOS' ? '' : estado) ? 'contained' : 'outlined'}
                onClick={() => filtrar(estado)}
                sx={{
                  textTransform: 'none', borderRadius: 2,
                  bgcolor: filtroEstado === (estado === 'TODOS' ? '' : estado) ? '#083927' : 'transparent',
                  color: filtroEstado === (estado === 'TODOS' ? '' : estado) ? '#fff' : '#475569',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: filtroEstado === (estado === 'TODOS' ? '' : estado) ? '#0B6E4F' : '#F1F5F9' }
                }}
              >
                {estado === 'TODOS' ? 'Todos' : ESTADOS[estado].label}
              </Button>
            ))}
          </Box>

          {/* Tabela */}
          <Card variant="outlined" sx={{boxShadow: '0 4px 12px rgba(0,0,0,0.03)',mr:6}}>
            <TableContainer sx={{ maxHeight: '60vh'}}>
              <Table stickyHeader size="small">
                <TableHead >
                  <TableRow >
                    {['Assunto', 'Utilizador', 'Categoria', 'Prioridade', 'Estado', 'Data', 'Acção'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, bgcolor: '#F1F5F9',height:"60px",
                        color: "#64748b",
                        fontSize: "0.75rem"}}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}><CircularProgress size={30} /></TableCell></TableRow>
                  ) : filtrados.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="textSecondary">Nenhum pedido encontrado.</Typography>
                    </TableCell></TableRow>
                  ) : (
                    filtrados.map((pedido) => (
                      <TableRow  hover sx={{height:"80px"}}>
                        {/*<TableCell sx={{ fontWeight: 700, color: '#083927' }}>{pedido.codigo}</TableCell>*/}
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pedido.assunto}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.83rem' }}>{pedido.nomeUtilizador}</Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>{pedido.emailUtilizador}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            {CATEGORIAS[pedido.categoria] || pedido.categoria}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={PRIORIDADES[pedido.prioridade]?.label || pedido.prioridade}
                            color={PRIORIDADES[pedido.prioridade]?.cor || 'default'} sx={{ fontWeight: 600, fontSize: 11, height: 22 }} />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 130 }}>
                            <Select
                              value={pedido.estado}
                              onChange={(e) => mudarEstado(pedido.id, e.target.value)}
                              sx={{ borderRadius: 2, fontSize: '0.8rem', height: 32 }}
                            >
                              {Object.entries(ESTADOS).map(([valor, info]) => (
                                <MenuItem key={valor} value={valor}>{info.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                            {new Date(pedido.dataCriacao).toLocaleDateString('pt-PT')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Ver detalhes">
                            <IconButton size="small" onClick={() => abrirDetalhe(pedido)}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Detalhe do pedido */}
      <Dialog open={!!detalhe} onClose={() => setDetalhe(null)} maxWidth="sm" fullWidth>
        {detalhe && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {detalhe.codigo} — {detalhe.assunto}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {detalhe.nomeUtilizador} ({detalhe.emailUtilizador}) · {new Date(detalhe.dataCriacao).toLocaleString('pt-PT')}
                </Typography>
              </Box>
              <IconButton onClick={() => setDetalhe(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip size="small" label={CATEGORIAS[detalhe.categoria] || detalhe.categoria} variant="outlined" />
                <Chip size="small" label={`Prioridade: ${PRIORIDADES[detalhe.prioridade]?.label || detalhe.prioridade}`}
                  color={PRIORIDADES[detalhe.prioridade]?.cor || 'default'} sx={{ fontWeight: 600 }} />
                <Chip size="small" label={ESTADOS[detalhe.estado]?.label || detalhe.estado}
                  color={ESTADOS[detalhe.estado]?.cor || 'default'} sx={{ fontWeight: 600 }} />
              </Stack>

              <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap', mb: 2 }}>{detalhe.descricao}</Typography>

              {detalhe.anexos?.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>ANEXOS</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, flexWrap: 'wrap' }}>
                    {detalhe.anexos.map((anexo) => (
                      <Paper key={anexo.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1.5 }}>
                        {ehImagem(anexo) ? <ImageIcon sx={{ fontSize: 16, color: '#083927' }} /> : <DocIcon sx={{ fontSize: 16, color: '#64748B' }} />}
                        <Typography variant="caption" sx={{ fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {anexo.nomeOriginal}
                        </Typography>
                        {ehImagem(anexo) && (
                          <Tooltip title="Ver imagem">
                            <IconButton size="small" onClick={() => verAnexo(anexo)} sx={{ p: 0.3 }}><ImageIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Descarregar">
                          <IconButton size="small" onClick={() => pedidosSuporteApi.baixarAnexo(anexo.id, anexo.nomeOriginal)} sx={{ p: 0.3 }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>Resposta / nota do suporte</Typography>
              <TextField
                fullWidth size="small" multiline rows={3}
                placeholder="Deixe aqui a resposta para o utilizador..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetalhe(null)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Fechar</Button>
              <Button variant="contained" onClick={guardarObservacao} sx={{ bgcolor: '#083927', '&:hover': { bgcolor: '#0B6E4F' }, textTransform: 'none', fontWeight: 600 }}>
                Guardar resposta
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Pré-visualização de imagem */}
      <Dialog open={!!preview} onClose={fecharPreview} maxWidth="md">sx={{backgroundColor:"#F1F5F9", borderradius: "2px"}}
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{preview?.nome}</Typography>
          <IconButton onClick={fecharPreview}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          {preview && <img src={preview.url} alt={preview.nome} style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 8 }} />}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
