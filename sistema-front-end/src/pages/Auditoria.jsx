import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, Chip, Stack, Button, Tooltip, Paper, InputBase, IconButton
} from '@mui/material';
import { 
  Search as SearchIcon, History as HistoryIcon, Login as LoginIcon,
  Refresh as RefreshIcon, FilterAltOutlined as FilterAltOutlinedIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';
import { formatData } from '../utils/formatters';

const OPERACOES = [
  { valor: 'TODAS', label: 'Todas as operações' },
  { valor: 'LOGIN', label: 'Login' },
  { valor: 'LOGIN_FALHA', label: 'Login falhado' },
  { valor: 'REGISTO', label: 'Registo' },
  { valor: 'CRIOU', label: 'Criação' },
  { valor: 'ATUALIZOU', label: 'Actualização' },
  { valor: 'REMOVEU', label: 'Remoção' },
];

const itensPorPagina = 8;

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroOperacao, setFiltroOperacao] = useState('TODAS');
  const [paginaAtual, setPaginaAtual] = useState(0);

  useEffect(() => {
    fetchAuditorias();
  }, []);

  const fetchAuditorias = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/auditoria');
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar auditoria', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs
    .filter(log => 
      filtroOperacao === 'TODAS' || log.operacao?.toUpperCase() === filtroOperacao
    )
    .filter(log => 
      log.operacao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.entidade?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.detalhes?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.usuario?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (log.ip && log.ip.toLowerCase().includes(pesquisa.toLowerCase()))
    );

  // Paginação (padrão dos módulos de faturação/clientes/fornecedores)
  const totalPaginas = Math.ceil(filteredLogs.length / itensPorPagina);
  // Garante que a página nunca ultrapasse os dados disponíveis após alterações
  const startIndex = Math.min(paginaAtual * itensPorPagina, Math.max(0, filteredLogs.length - itensPorPagina));
  const logsPaginados = filteredLogs.slice(startIndex, startIndex + itensPorPagina);

  useEffect(() => {
    setPaginaAtual(0);
  }, [pesquisa, filtroOperacao]);

  const getOperacaoColor = (operacao) => {
    switch (operacao?.toUpperCase()) {
      case 'LOGIN': return 'primary';
      case 'LOGIN_FALHA': return 'error';
      case 'REGISTO': return 'info';
      case 'CRIOU': return 'success';
      case 'ATUALIZOU': return 'warning';
      case 'REMOVEU': return 'error';
      case 'ACESSO': return 'default';
      default: return 'default';
    }
  };

  const getOperacaoIcon = (operacao) => {
    switch (operacao?.toUpperCase()) {
      case 'LOGIN': return <LoginIcon sx={{ fontSize: 14, mr: 0.5 }} />;
      default: return null;
    }
  };

  // Agrupa logs por utilizador para mostrar quem acedeu ao sistema
  const usuariosAtivos = [...new Set(logs.map(log => log.usuario))].sort();

  return (
    <div>
      <NavBar />
      <Box display={"flex"}>
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
          {/* Cabeçalho */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111" }}>
                  Histórico de Auditoria
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {logs.length} registos · {usuariosAtivos.length} utilizadores activos
                </Typography>
              </Box>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button 
                size="small" 
                startIcon={<RefreshIcon />} 
                onClick={fetchAuditorias}
                sx={{ textTransform: 'none' }}
              >
                Actualizar
              </Button>
            </Stack>
          </Box>
          
          {/* Resumo de Utilizadores Activos */}
          {usuariosAtivos.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', mb: 1, display: 'block' }}>
                UTILIZADORES QUE ACESSARAM O SISTEMA
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {usuariosAtivos.map((usuario) => {
                  const logsDoUsuario = logs.filter(l => l.usuario === usuario);
                  const ultimoAcesso = logsDoUsuario.length > 0 
                    ? new Date(logsDoUsuario[0].dataHora).toLocaleString() 
                    : '-';
                  return (
                    <Tooltip key={usuario} title={`Último acesso: ${ultimoAcesso} · ${logsDoUsuario.length} acções`}>
                      <Chip
                        label={`${usuario.split('(')[0].trim()} (${logsDoUsuario.length})`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600, 
                          borderColor: '#083927',
                          color: '#083927',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#e8f5e9' }
                        }}
                        onClick={() => setPesquisa(usuario.split('(')[0].trim())}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Card>
          )}

          {/* Tabela de Auditoria */}
          <Card sx={{ maxWidth: 2000 }}>
            {/* Filtros rápidos por operação */}
         
            <CardContent
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 5 },
                height: { xs: "auto", sm: "40px" },
                alignItems: "center",
                justifyContent: "space-between",
                overflowX: "auto",
                whiteSpace: "nowrap",
                py: { xs: 1, sm: 2 }
              }}
            >
              {OPERACOES.map((op) => (
                <Button
                  key={op.valor}
                  variant="text"
                  onClick={() => setFiltroOperacao(op.valor)}
                  sx={{
                    color: filtroOperacao === op.valor ? "#0B6E4F" : "black",
                    fontSize: "0.85rem",
                    fontWeight: filtroOperacao === op.valor ? "bold" : "500",
                    textTransform: "none",
                    minWidth: "auto",
                  }}
                >
                  {op.label}
                </Button>
              ))}
            </CardContent>
         

            <TableContainer sx={{ maxHeight: { xs: '70vh', md: '65vh' }, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 760 }}>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem", width: 160 }}>Data e Hora</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem", width: 250 }}>Utilizador</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem", width: 130 }}>Operação</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem", width: 130 }}>Entidade</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem" }}>Detalhes</TableCell>
                    <TableCell sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.75rem", width: 130 }}>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">Nenhum registo de auditoria encontrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logsPaginados.map((log) => (
                      <TableRow key={log.id} hover sx={{ 
                        bgcolor: log.operacao === 'LOGIN_FALHA' ? '#fff5f5' : 'inherit',
                        opacity: log.operacao === 'REMOVEU' ? 0.85 : 1
                      }}>
                        <TableCell sx={{ color: "#555", fontSize: "0.85rem", whiteSpace: 'nowrap' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                              {formatData(log.dataHora)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {new Date(log.dataHora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                            {log.usuario?.split('(')[0]?.trim() || log.usuario}
                          </Typography>
                          {log.usuario?.includes('(') && (
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                              {log.usuario.split('(')[1]?.replace(')', '')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.operacao} 
                            size="small" 
                            color={getOperacaoColor(log.operacao)}
                            icon={getOperacaoIcon(log.operacao)}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: 24 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                            {log.entidade}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#666", fontSize: "0.85rem" }}>
                            {log.detalhes}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", fontFamily: 'monospace' }}>
                            {log.ip || '-'}
                          </Typography>
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
                A mostrar {filteredLogs.length > 0 ? startIndex + 1 : 0} a{" "}
                {Math.min(startIndex + itensPorPagina, filteredLogs.length)} de{" "}
                {filteredLogs.length} registo(s)
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
        </Box>
      </Box>
    </div>
  );
}
