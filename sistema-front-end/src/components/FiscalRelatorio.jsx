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
      const ivaAPagar = Number(data.ivaAPagar ?? 0);
      const ivaARecuperar = Number(data.ivaARecuperar ?? 0);
      const total = ivaAPagar + ivaARecuperar;
      const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
      setValores([ivaAPagar, ivaARecuperar]);
      setPercentagens({ ivaAPagar: pct(ivaAPagar), ivaARecuperar: pct(ivaARecuperar) });
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '2px' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>IVA Liquidado</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{percentagens.ivaAPagar}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#22c55e', borderRadius: '2px' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>IVA Dedutível (A Recup.)</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{percentagens.ivaARecuperar}%</Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
