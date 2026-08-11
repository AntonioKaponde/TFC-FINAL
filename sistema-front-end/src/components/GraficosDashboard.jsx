import { Box, Card, Grid, Typography } from '@mui/material'
import React from 'react'
import Grafico from './Grafico';
import FiscalCard from './FiscalCard';
import TabelaDashboard from './TabelaDashboard';

export default function GraficosDashboard() {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          width: '100%',
          alignItems: 'stretch'
        }}
      >
        <Card sx={{ p: { xs: 2, md: 3 }, flex: 1, minWidth: 0 }}>
          <Grid>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Imposto a Pagar VS Lucros Retidos</Typography>
            <Typography variant="caption" color="textSecondary">Comparação mensal do ano corrente(Em Kz)</Typography>
          </Grid>
          <Grid>
            <Grafico />
          </Grid>
        </Card>
        <Box sx={{ width: { xs: '100%', lg: '22.3rem' }, flexShrink: 0 }}>
          <FiscalCard />
        </Box>
      </Box>
      <Box sx={{ mt: 2, width: '100%' }}>
        <TabelaDashboard />
      </Box>
    </Box>
  )
}
