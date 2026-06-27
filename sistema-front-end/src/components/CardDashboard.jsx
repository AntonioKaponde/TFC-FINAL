import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { dashboardApi } from '../api';
import { ANO_REFERENCIA, formatKz } from '../utils/formatters';

export default function CardDashboard() {
  const [indicadores, setIndicadores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    dashboardApi
      .indicadores(ANO_REFERENCIA)
      .then(setIndicadores)
      .catch((e) => setErro(e.response?.data?.message || e.response?.data || e.message || "Erro desconhecido"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  if (erro) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Não foi possível carregar os indicadores: {erro}
      </Typography>
    );
  }

  const cards = [
    {
      titulo: 'Faturação Bruta',
      valor: formatKz(indicadores.faturacaoBruta),
      icon: <DescriptionOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} />,
    },
    {
      titulo: `IVA a Pagar (${indicadores.taxaIvaAplicada}%)`,
      valor: formatKz(indicadores.ivaAPagar),
      icon: <PaymentsOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} />,
    },
    {
      titulo: 'Total Impostos',
      valor: formatKz(indicadores.totalImpostos),
      icon: <CreditCardOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} />,
      cor: '#ff250d',
    },
    {
      titulo: 'Lucro Retido',
      valor: formatKz(indicadores.lucroRetido),
      icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} />,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 23, justifyContent: "center" }}>
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ minWidth: 336, p: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontSize: '1rem', color: '#64748b' }}>{card.titulo}</Typography>
                {card.icon}
              </Box>
              <Box sx={{ color: card.cor }}>
                <h2>{card.valor}</h2>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </div>
  );
}
