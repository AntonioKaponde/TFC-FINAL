import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, Chip, TextField, InputAdornment, Grid,
  FormControl, InputLabel, Select, MenuItem, Stack, Button, Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon, History as HistoryIcon, Login as LoginIcon,
  FilterList as FilterIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';
import { formatData } from '../utils/formatters';

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroOperacao, setFiltroOperacao] = useState('TODOS');

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
      filtroOperacao === 'TODOS' || log.operacao?.toUpperCase() === filtroOperacao
    )
    .filter(log => 
      log.operacao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.entidade?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.detalhes?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      log.usuario?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (log.ip && log.ip.toLowerCase().includes(pesquisa.toLowerCase()))
    );

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
              <HistoryIcon sx={{ color: "#083927", fontSize: 32 }} />
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
              <TextField
                size="small"
                placeholder="Pesquisar logs..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  sx: { borderRadius: 2, bgcolor: "#fff", minWidth: { xs: 0, sm: 250 } }
                }}
              />
            </Stack>
          </Box>

          {/* Filtros */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterIcon sx={{ color: '#64748b' }} />
            <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 180 } }}>
              <Select
                value={filtroOperacao}
                onChange={(e) => setFiltroOperacao(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}
              >
                <MenuItem value="TODOS">Todas as operações</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="LOGIN_FALHA">Login Falhado</MenuItem>
                <MenuItem value="REGISTO">Registo</MenuItem>
                <MenuItem value="CRIOU">Criação</MenuItem>
                <MenuItem value="ATUALIZOU">Actualização</MenuItem>
                <MenuItem value="REMOVEU">Remoção</MenuItem>
              </Select>
            </FormControl>
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
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <TableContainer sx={{ maxHeight: { xs: '70vh', md: '65vh' }, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", py: 2, width: 160 }}>Data e Hora</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", width: 250 }}>Utilizador</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", width: 130 }}>Operação</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", width: 130 }}>Entidade</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Detalhes</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", width: 130 }}>IP</TableCell>
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
                    filteredLogs.map((log) => (
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
          </Card>
        </Box>
      </Box>
    </div>
  );
}
