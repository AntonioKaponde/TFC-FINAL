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
  const totalImpostos = Number(indicadores.totalImpostos);
  const irt = Math.max(totalImpostos - iva, 0);

  const cards = [
    { titulo: `IVA a Liquidar (${indicadores.taxaIvaAplicada}%)`, valor: formatKz(iva), icon: <AccountBalanceOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'IRT Retido', valor: formatKz(irt), icon: <PeopleAltOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Imposto Industrial(25%)', valor: formatKz(0), icon: <ApprovalOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Lucros Retidos', valor: formatKz(indicadores.lucroRetido), icon: <TrendingUpOutlinedIcon sx={{ fontSize: '2rem' }} /> },
  ];

  return (
    <div style={{ display: "flex", gap: 23, justifyContent: "center" }}>
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ minWidth: 336, p: 2,ml:0.4 }}>
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
    </div>
  );
}
