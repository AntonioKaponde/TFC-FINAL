import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ApprovalOutlinedIcon from '@mui/icons-material/ApprovalOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { dashboardApi } from "../api";
import { ANO_REFERENCIA, formatKz } from "../utils/formatters";

export default function CardRelatorio() {
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
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  const iva = Number(indicadores.ivaAPagar);
  const volumeVendas = Number(indicadores.volumeVendas ?? 0);
  const volumeCompras = Number(indicadores.volumeCompras ?? 0);

  const cards = [
    { titulo: `IVA Liquidado (${indicadores.taxaIvaAplicada}%)`, valor: formatKz(iva), icon: <AccountBalanceOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Volume de Vendas', valor: formatKz(volumeVendas), icon: <TrendingUpOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Volume de Compras', valor: formatKz(volumeCompras), icon: <ApprovalOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Lucros Retidos', valor: formatKz(indicadores.lucroRetido), icon: <AccountBalanceOutlinedIcon sx={{ fontSize: '2rem' }} /> },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))"
        },
        gap: 2,
        width: "100%"
      }}
    >
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ width: "100%", p: 2, minHeight: "10rem", borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ fontSize: '1rem', color: '#64748b' }}>{card.titulo}</Typography>
                {card.icon}
              </Box>
              <Box>
                <h2>{card.valor}</h2>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
