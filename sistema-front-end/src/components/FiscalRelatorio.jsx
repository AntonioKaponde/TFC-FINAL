import { Box, Card, CircularProgress, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DoughnutRelatorio from './DoughnutRelatorio'
import { dashboardApi } from '../api';
import { ANO_REFERENCIA } from '../utils/formatters';

export default function FiscalRelatorio() {
  const [valores, setValores] = useState(null);
  const [percentagens, setPercentagens] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.indicadores(ANO_REFERENCIA).then((data) => {
      const iva = Number(data.ivaAPagar);
      const total = Number(data.totalImpostos ?? iva);
      const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
      setValores([iva]);
      setPercentagens({ iva: pct(iva) });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid>
          <Card sx={{ height: "40rem" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Distribuição Fiscal</Typography>
              <Typography variant="caption" color="textSecondary">Composição do total a pagar ({ANO_REFERENCIA})</Typography>
            </Box>
            <Box sx={{ p: 5 }}>
              {loading ? (
                <Box display="flex" justifyContent="center">
                  <CircularProgress sx={{ color: '#0B6E4F' }} />
                </Box>
              ) : (
                <DoughnutRelatorio valores={valores} />
              )}
            </Box>
            {percentagens && (
              <Box sx={{ display: "flex" }}>
                <Grid sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography>IVA</Typography>
                </Grid>
                <Grid sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, ml: 15 }}>
                  <Typography>{percentagens.iva}%</Typography>
                </Grid>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
