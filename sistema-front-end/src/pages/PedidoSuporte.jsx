import React, { useState, useEffect } from 'react';import {
  Box, Typography, Card, Grid, Button, TextField, MenuItem, FormControl,
  InputLabel, Select, Chip, IconButton, Stack, Alert, Snackbar, CircularProgress,
  Dialog, DialogTitle, DialogContent, Paper, Tooltip
} from '@mui/material';
import {
  SupportAgent as SupportIcon,
  AttachFile as AttachIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { pedidosSuporteApi } from '../api';

const CATEGORIAS = [
  { valor: 'PROBLEMA_TECNICO', label: 'Problema técnico' },
  { valor: 'ERRO_SISTEMA', label: 'Erro no sistema' },
  { valor: 'DUVIDA_UTILIZACAO', label: 'Dúvida de utilização' },
  { valor: 'SOLICITACAO_MELHORIA', label: 'Solicitação de melhoria' },
];

const PRIORIDADES = [
  { valor: 'BAIXA', label: 'Baixa', cor: 'default' },
  { valor: 'MEDIA', label: 'Média', cor: 'info' },
  { valor: 'ALTA', label: 'Alta', cor: 'warning' },
  { valor: 'CRITICA', label: 'Crítica', cor: 'error' },
];

const ESTADOS = {
  ABERTO: { label: 'Aberto', cor: 'info' },
  EM_ANALISE: { label: 'Em análise', cor: 'warning' },
  EM_ATENDIMENTO: { label: 'Em atendimento', cor: 'primary' },
  RESOLVIDO: { label: 'Resolvido', cor: 'success' },
  FECHADO: { label: 'Fechado', cor: 'default' },
  CANCELADO: { label: 'Cancelado', cor: 'error' },
};

export default function PedidoSuporte() {
  const [form, setForm] = useState({ assunto: '', categoria: '', prioridade: 'MEDIA', descricao: '' });
  const [ficheiros, setFicheiros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [preview, setPreview] = useState(null); // {nome, url}

  const showMessage = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await pedidosSuporteApi.meus();
      setPedidos(data);
    } catch (e) {
      console.error('Erro ao carregar pedidos de suporte', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const formatarTamanho = (bytes) => {
    if (bytes == null) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEnviar = async () => {
    if (!form.assunto.trim() || !form.categoria || !form.descricao.trim()) {
      showMessage('Preencha o assunto, a categoria e a descrição.', 'warning');
      return;
    }
    if (ficheiros.length > 5) {
      showMessage('Pode anexar no máximo 5 ficheiros.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('assunto', form.assunto);
    formData.append('descricao', form.descricao);
    formData.append('categoria', form.categoria);
    formData.append('prioridade', form.prioridade);
    ficheiros.forEach((f) => formData.append('anexos', f));

    setEnviando(true);
    try {
      await pedidosSuporteApi.criar(formData);
      showMessage('Pedido de suporte enviado com sucesso!');
      setForm({ assunto: '', categoria: '', prioridade: 'MEDIA', descricao: '' });
      setFicheiros([]);
      carregar();
    } catch (e) {
      showMessage(e.message || 'Erro ao enviar o pedido.', 'error');
    } finally {
      setEnviando(false);
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

  return (
    <div>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, mt: 10, ml: { md: 6 }, mr: { md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <SupportIcon sx={{ color: '#083927', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Pedido de Suporte</Typography>
              <Typography variant="caption" color="textSecondary">
                Envie um problema, erro ou dúvida — a equipa de suporte irá acompanhar.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Formulário */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#fff' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                  Novo pedido
                </Typography>

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, display: 'block' }}>
                  Assunto do problema
                </Typography>
                <TextField
                  fullWidth size="small" placeholder="Ex.: Erro ao emitir factura"
                  value={form.assunto}
                  onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        label="Categoria"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        {CATEGORIAS.map((c) => <MenuItem key={c.valor} value={c.valor}>{c.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Prioridade</InputLabel>
                      <Select
                        label="Prioridade"
                        value={form.prioridade}
                        onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                        sx={{ borderRadius: 2 }}
                      >
                        {PRIORIDADES.map((p) => <MenuItem key={p.valor} value={p.valor}>{p.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, display: 'block' }}>
                  Descrição da dificuldade
                </Typography>
                <TextField
                  fullWidth size="small" multiline rows={4}
                  placeholder="Descreva o que aconteceu, o que tentou fazer e o resultado esperado..."
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                {/* Anexos */}
                <Box
                  component="label"
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, border: '1.5px dashed #CBD5E1',
                    borderRadius: 2, p: 1.5, cursor: 'pointer', '&:hover': { borderColor: '#083927', bgcolor: '#F8FAFC' }
                  }}
                >
                  <AttachIcon sx={{ color: '#083927' }} />
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                    Anexar imagens ou documentos (prints de erros)
                  </Typography>
                  <input
                    type="file" multiple hidden
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => setFicheiros(Array.from(e.target.files || []))}
                  />
                </Box>

                {ficheiros.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                    {ficheiros.map((f, i) => (
                      <Chip
                        key={i} size="small"
                        label={f.name}
                        onDelete={() => setFicheiros(ficheiros.filter((_, idx) => idx !== i))}
                        sx={{ maxWidth: 200 }}
                      />
                    ))}
                  </Stack>
                )}

                <Button
                  fullWidth variant="contained" onClick={handleEnviar} disabled={enviando}
                  startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  sx={{ mt: 2.5, bgcolor: '#083927', '&:hover': { bgcolor: '#0B6E4F' }, borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1.2 }}
                >
                  {enviando ? 'A enviar...' : 'Enviar pedido de suporte'}
                </Button>
              </Card>
            </Grid>

            {/* Lista dos meus pedidos */}
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#fff' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    Os meus pedidos
                    <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      ({pedidos.length})
                    </Typography>
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={30} sx={{ color: '#083927' }} /></Box>
                ) : pedidos.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography color="textSecondary">Ainda não criou nenhum pedido de suporte.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: '62vh', overflowY: 'auto', p: 2 }}>
                    {pedidos.map((pedido) => (
                      <Paper key={pedido.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, borderColor: '#E2E8F0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              <span style={{ color: '#64748B', fontWeight: 600 }}>{pedido.codigo}</span> — {pedido.assunto}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(pedido.dataCriacao).toLocaleString('pt-PT')}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              size="small" label={PRIORIDADES.find(p => p.valor === pedido.prioridade)?.label || pedido.prioridade}
                              color={PRIORIDADES.find(p => p.valor === pedido.prioridade)?.cor || 'default'}
                              sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                            />
                            <Chip
                              size="small" label={ESTADOS[pedido.estado]?.label || pedido.estado}
                              color={ESTADOS[pedido.estado]?.cor || 'default'}
                              sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                            />
                          </Stack>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#475569', mt: 1, whiteSpace: 'pre-wrap' }}>
                          {pedido.descricao}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                          Categoria: {CATEGORIAS.find(c => c.valor === pedido.categoria)?.label || pedido.categoria}
                        </Typography>

                        {pedido.anexos?.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                            {pedido.anexos.map((anexo) => (
                              <Box key={anexo.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 1.5, px: 1, py: 0.5 }}>
                                {ehImagem(anexo) ? <ImageIcon sx={{ fontSize: 16, color: '#083927' }} /> : <DocIcon sx={{ fontSize: 16, color: '#64748B' }} />}
                                <Tooltip title={`${anexo.nomeOriginal} (${formatarTamanho(anexo.tamanho)})`}>
                                  <Typography variant="caption" sx={{ fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {anexo.nomeOriginal}
                                  </Typography>
                                </Tooltip>
                                {ehImagem(anexo) && (
                                  <Tooltip title="Ver imagem">
                                    <IconButton size="small" onClick={() => verAnexo(anexo)} sx={{ p: 0.3 }}>
                                      <ImageIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <IconButton size="small" onClick={() => pedidosSuporteApi.baixarAnexo(anexo.id, anexo.nomeOriginal)} sx={{ p: 0.3 }}>
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        )}

                        {pedido.observacao && (
                          <Box sx={{ mt: 1.5, bgcolor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 1.5, p: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#083927' }}>Resposta do suporte:</Typography>
                            <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{pedido.observacao}</Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Pré-visualização de imagem */}
      <Dialog open={!!preview} onClose={fecharPreview} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{preview?.nome}</Typography>
          <IconButton onClick={fecharPreview}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          {preview && <img src={preview.url} alt={preview.nome} style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 8 }} />}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
