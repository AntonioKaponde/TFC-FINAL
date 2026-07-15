import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Button, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Paper, Stack, CircularProgress,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { faturasApi } from '../api';
import { agruparFaturasPorMes, formatData, formatKzSemPrefixo, formatPeriodo } from '../utils/formatters';
import { exportarPDF } from '../utils/pdfExport';

const TabelaFicheiro = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 5;

  const startIndex = paginaAtual * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const gruposPaginados = grupos.slice(startIndex, endIndex);
  const totalPaginas = Math.ceil(grupos.length / itensPorPagina);

  const handleAnterior = () => {
    if (paginaAtual > 0) setPaginaAtual(p => p - 1);
  };
  const handleProximo = () => {
    if (paginaAtual < totalPaginas - 1) setPaginaAtual(p => p + 1);
  };

  useEffect(() => {
    faturasApi
      .listar()
      .then((faturas) => setGrupos(agruparFaturasPorMes(faturas)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ height: '100vh', fontFamily: 'Inter, sans-serif', margin: "20px 0" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ overflow: 'hidden', width: "81rem" }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight="700">Histórico de Ficheiros Gerados</Typography>
              <Box>
                <Button size="small" disabled onClick={() => exportarPDF('tabela-historico-ficheiros', 'Historico_Ficheiros')} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', color: '#64748b', mr: 2 }}>Exportar PDF</Button>
                <Button size="small" startIcon={<FilterIcon />} sx={{ textTransform: 'none', color: '#64748b' }}>Filtrar</Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress sx={{ color: '#0B6E4F' }} />
              </Box>
            ) : (
              <TableContainer id="tabela-historico-ficheiros" component={Paper} elevation={0}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      {['Período', 'Última Emissão', 'N.º Documentos', 'Total Faturado (Kz)', 'Estado no Portal', 'Ações'].map((head) => (
                        <TableCell key={head} sx={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>{head}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gruposPaginados.map((row) => (
                      <TableRow key={row.chave} hover>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: '500' }}>{formatPeriodo(row.chave)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatData(row.ultimaEmissao)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{row.docs}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.total)}</TableCell>
                        <TableCell>
                          <Chip label="Calculado" size="small" color="success" sx={{ color: '#fff', fontWeight: '600', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small"><MoreVertIcon sx={{ fontSize: 18 }} /></IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="caption" color="textSecondary">A mostrar {startIndex + 1} a {Math.min(endIndex, grupos.length)} de {grupos.length} período(s)</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={handleAnterior} disabled={paginaAtual === 0} sx={{ textTransform: 'none' }}>Anterior</Button>
                <Button size="small" onClick={handleProximo} disabled={paginaAtual >= totalPaginas - 1} sx={{ textTransform: 'none' }}>Próximo</Button>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TabelaFicheiro;
