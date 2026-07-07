import { Box, Button, Card, Chip, CircularProgress, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Download as DownloadIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { dashboardApi } from '../api';
import { ANO_REFERENCIA, formatKzSemPrefixo, resumoMensalImpostos } from '../utils/formatters';

export default function TabelaRelatorio() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 5;

  const startIndex = paginaAtual * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const rowsPaginados = rows.slice(startIndex, endIndex);
  const totalPaginas = Math.ceil(rows.length / itensPorPagina);

  const handleAnterior = () => {
    if (paginaAtual > 0) setPaginaAtual(p => p - 1);
  };
  const handleProximo = () => {
    if (paginaAtual < totalPaginas - 1) setPaginaAtual(p => p + 1);
  };

  useEffect(() => {
    dashboardApi
      .comparativoMensal(ANO_REFERENCIA)
      .then((data) => setRows(resumoMensalImpostos(data)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Card sx={{ width: "84rem" }}>
          <Grid sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Resumo Mensal de Impostos</Typography>
            <Typography variant="caption" color="textSecondary">Histórico de valores calculados e estado de submissão</Typography>
          </Grid>
          <Grid>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress sx={{ color: '#0B6E4F' }} />
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    {['Período', 'IVA Liquidado(Kz)', 'IVA Dedutível(Kz)', 'IVA a Entregar (Kz)', 'Estado AGT', 'Ações'].map((head) => (
                      <TableCell key={head} sx={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>{head}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowsPaginados.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontSize: '0.85rem', fontWeight: '500' }}>{row.periodo} {ANO_REFERENCIA}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.ivaLiquidado)}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.ivaDedutivel)}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.ivaEntregar)}</TableCell>
                      <TableCell>
                        <Chip label={row.estado} size="small" color="success" sx={{ color: '#fff', fontWeight: '600', fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => dashboardApi.baixarRelatorioImpostosPdf(ANO_REFERENCIA)}><DownloadIcon sx={{ fontSize: 18 }} /></IconButton>
                          <IconButton size="small"><MoreVertIcon sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
              <Typography variant="caption" color="textSecondary">A mostrar {startIndex + 1} a {Math.min(endIndex, rows.length)} de {rows.length} registo(s)</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={handleAnterior} disabled={paginaAtual === 0} sx={{ textTransform: 'none' }}>Anterior</Button>
                <Button size="small" onClick={handleProximo} disabled={paginaAtual >= totalPaginas - 1} sx={{ textTransform: 'none' }}>Próximo</Button>
              </Stack>
            </Box>
          </Grid>
        </Card>
      </Grid>
    </div>
  )
}
