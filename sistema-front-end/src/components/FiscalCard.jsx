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
  Tooltip,
  Divider,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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

const TaxRow = ({ label, value, totalPercentage, color, tooltip }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: '2px', mr: 0.5 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow>
            <InfoOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8', cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
        Kz {value}
      </Typography>
    </Box>
    <BorderLinearProgress variant="determinate" value={Math.min(totalPercentage, 100)} barcolor={color} />
    <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
      {totalPercentage}% do IVA Liquidado
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card sx={{ width: '100%', p: 4, minHeight: '20rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Card>
    );
  }

  const ivaAPagar     = Number(indicadores?.ivaAPagar     ?? 0);
  const ivaARecuperar = Number(indicadores?.ivaARecuperar ?? 0);
  const ivaLiquido    = Number(indicadores?.ivaLiquido    ?? (ivaAPagar - ivaARecuperar));

  const totalImpostos = ivaAPagar + ivaARecuperar;
  const total = totalImpostos > 0 ? totalImpostos : 1;

  // IVA Liquidado usa ivaAPagar (bruto das vendas) — cresce a cada factura
  // IVA Dedutivel usa ivaARecuperar (das compras)
  const pct = (valor) => Math.round((Math.abs(valor) / total) * 100);

  return (
    <Card sx={{ width: '100%', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', p: 2, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
              Carga Fiscal ({ANO_REFERENCIA})
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Baseado na legislação CIVA Angola
            </Typography>
          </Box>
          <IconButton size="small" sx={{ bgcolor: '#f8fafc' }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* IVA Liquidado — IVA cobrado nas vendas */}
        <TaxRow
          label="IVA Liquidado"
          value={formatKzSemPrefixo(ivaAPagar)}
          totalPercentage={pct(ivaAPagar)}
          color="#ef4444"
          tooltip="IVA cobrado aos clientes nas facturas emitidas. (Art. 22.º CIVA Angola)"
        />

        {/* IVA Dedutível — verde */}
        <TaxRow
          label="IVA Dedutível (A Recup.)"
          value={formatKzSemPrefixo(ivaARecuperar)}
          totalPercentage={pct(ivaARecuperar)}
          color="#22c55e"
          tooltip="IVA dedutível pago nas compras (Art. 19.º CIVA Angola — apenas Regime Geral). Baseia-se no preço de custo dos artigos."
        />

        <Divider sx={{ my: 2 }} />

        {/* Resumo */}
        <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1.5 }}>
            RESUMO FISCAL
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>IVA Cobrado nas Vendas</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6366f1' }}>Kz {formatKzSemPrefixo(ivaAPagar)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>IVA Pago nas Compras</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#22c55e' }}>Kz {formatKzSemPrefixo(ivaARecuperar)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e293b' }}>A Entregar à AGT</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef4444' }}>Kz {formatKzSemPrefixo(Math.abs(ivaLiquido))}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
