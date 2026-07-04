import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  styled,
  CircularProgress,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { dashboardApi } from '../api';
import { ANO_REFERENCIA, formatKzSemPrefixo } from '../utils/formatters';

const BorderLinearProgress = styled(LinearProgress)(({ theme, barcolor }) => ({
  height: 8,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[100],
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
    backgroundColor: barcolor,
  },
}));

const TaxRow = ({ label, value, totalPercentage, color }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: '2px', mr: 1.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
        Kz {value}
      </Typography>
    </Box>
    <BorderLinearProgress variant="determinate" value={totalPercentage} barcolor={color} />
    <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
      {totalPercentage}% do total de impostos
    </Typography>
  </Box>
);

export default function FiscalCard() {
  const [indicadores, setIndicadores] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .indicadores(ANO_REFERENCIA)
      .then(setIndicadores)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card sx={{ width: "22.3rem", p: 4, height: "38rem", display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Card>
    );
  }

  const iva = Number(indicadores?.ivaAPagar ?? 0);
  const total = Number(indicadores?.totalImpostos ?? 0);
  
  const pct = (valor) => (total > 0 ? Math.round((valor / total) * 100) : 0);

  return (
    <Card sx={{ width: "22.3rem", boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', p: 2, height: "38rem", margin: '0 auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
            Carga Fiscal ({ANO_REFERENCIA})
          </Typography>
          <IconButton size="small" sx={{ bgcolor: '#f8fafc' }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        <TaxRow
          label={`IVA (${indicadores?.taxaIvaAplicada ?? 14}%)`}
          value={formatKzSemPrefixo(iva)}
          totalPercentage={pct(iva)}
          color="#ef4444"
        />
      </CardContent>
    </Card>
  );
}
