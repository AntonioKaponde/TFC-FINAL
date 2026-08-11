import { Box, Button, Card, Chip, CircularProgress, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { faturasApi } from '../api';
import { formatData, formatKzSemPrefixo, labelEstadoFatura } from '../utils/formatters';

function getStatusColor(status) {
  switch (status) {
    case "Pago":
      return "success";
    case "Cancelado":
      return "error";
    case "Pendente":
    case "Vencido":
      return status === "Vencido" ? "error" : "warning";
    default:
      return "default";
  }
}

export default function TabelaDashboard() {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    faturasApi
      .listar()
      .then((data) => setFaturas(data.slice(0, 5)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Grid container spacing={2} sx={{ width: "100%" }}>
        <Card sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, m: "10px 0" }}>
            <Grid>
              <Typography sx={{ fontWeight: "bold" }}>Últimas Faturas Emitidas</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>Inventário e faturação em tempo real</Typography>
            </Grid>
            <Grid>
              <Button component={Link} to="/faturacao" variant='contained' sx={{ bgcolor: "#fff", color: "black" }}>Ver Todas</Button>
            </Grid>
          </Box>
          <Grid>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress sx={{ color: '#0B6E4F' }} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      {['Fatura', 'Cliente', 'Data de Emissão', 'Total (Kz)', 'IVA(Kz)', 'Estado', 'Ações'].map((head) => (
                        <TableCell key={head} sx={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>{head}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {faturas.map((row) => {
                      const estado = labelEstadoFatura(row.estado);
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell sx={{ fontSize: '0.85rem', fontWeight: '500' }}>{row.numero}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{row.cliente}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatData(row.dataEmissao)}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.total)}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: '#64748b' }}>{formatKzSemPrefixo(row.totalIva)}</TableCell>
                          <TableCell>
                            <Chip
                              label={estado}
                              size="small"
                              color={getStatusColor(estado)}
                              sx={{ color: '#fff', fontWeight: '600', fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small"><MoreVertIcon sx={{ fontSize: 18 }} /></IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Card>
      </Grid>
    </div>
  )
}
