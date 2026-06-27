import { Box, Button, Card, Grid, Typography } from '@mui/material'
import React from 'react'
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import Grafico from './Grafico';
import FiscalCard from './FiscalCard';
import TabelaDashboard from './TabelaDashboard';
import Chart from './Grafico';

export default function GraficosDashboard() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        <Card sx={{p:3,width:"60rem"}}>
            <Grid>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Imposto a Pagar VS Lucros Retidos</Typography>
                <Typography variant="caption" color="textSecondary">Comparação mensal do ano corrente(Em Kz)</Typography>
            </Grid>
            <Grid>
                <Grafico />
            </Grid>
        </Card>
        <Box>
          <FiscalCard />
        </Box>
        <Box>
          <TabelaDashboard />
        </Box>
      </Grid>
    </div>
  )
}
