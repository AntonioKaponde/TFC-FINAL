import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, Chip, TextField, InputAdornment, Grid
} from '@mui/material';
import { Search as SearchIcon, History as HistoryIcon } from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';
import { formatData } from '../utils/formatters';

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');

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

  const filteredLogs = logs.filter(log => 
    log.operacao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.entidade?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.detalhes?.toLowerCase().includes(pesquisa.toLowerCase()) ||
    log.usuario?.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const getOperacaoColor = (operacao) => {
    switch (operacao?.toUpperCase()) {
      case 'CRIOU': return 'success';
      case 'ATUALIZOU': return 'warning';
      case 'REMOVEU': return 'error';
      default: return 'default';
    }
  };

  return (
    <div>
      <NavBar />
      <Box display={"flex"}>
        <SideBar />
        <Box component={"main"} sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, mt: 10 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <HistoryIcon sx={{ color: "#083927", fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#111" }}>
                  Histórico de Auditoria
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Acompanhe todas as operações sensíveis realizadas no sistema.
                </Typography>
              </Box>
            </Box>
            <TextField
              size="small"
              placeholder="Pesquisar logs..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                sx: { borderRadius: 2, bgcolor: "#fff", minWidth: 250 }
              }}
            />
          </Box>

          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <TableContainer sx={{ maxHeight: '70vh' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", py: 2 }}>Data e Hora</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Utilizador</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Operação</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Entidade</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa" }}>Detalhes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={30} />
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography color="textSecondary">Nenhum registo de auditoria encontrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ color: "#555", fontSize: "0.85rem" }}>
                          {formatData(log.dataHora)} {new Date(log.dataHora).toLocaleTimeString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: "0.85rem" }}>{log.usuario}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.operacao} 
                            size="small" 
                            color={getOperacaoColor(log.operacao)}
                            sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: 22 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>{log.entidade}</TableCell>
                        <TableCell sx={{ color: "#666", fontSize: "0.85rem" }}>{log.detalhes}</TableCell>
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
