import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { faturasApi, notasCreditoApi } from "../api";
import { formatKz } from "../utils/formatters";

export default function CardFatura() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([faturasApi.listar(), notasCreditoApi.listar()])
      .then(([faturas, notas]) => {
        const faturado = faturas.reduce((s, f) => s + Number(f.total), 0);
        const porReceber = faturas
          .filter((f) => f.estado === 'PENDENTE')
          .reduce((s, f) => s + Number(f.total), 0);
        const vencido = faturas
          .filter((f) => f.estado === 'VENCIDO')
          .reduce((s, f) => s + Number(f.total), 0);
        
        const notasCredito = notas.reduce((s, nc) => s + Number(nc.valor), 0);

        setStats({ faturado, porReceber, vencido, notasCredito });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  const cards = [
    { titulo: 'Total Faturado', valor: formatKz(stats.faturado), icon: <PaymentOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} /> },
    { titulo: 'Por Receber', valor: formatKz(stats.porReceber), icon: <AccessTimeOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} /> },
    { titulo: 'Vencido', valor: formatKz(stats.vencido), icon: <WarningOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} />, cor: 'red' },
    { titulo: 'Nota de Crédito', valor: formatKz(stats.notasCredito), icon: <DescriptionOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} /> },
  ];

  return (
    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ minWidth: 329, p: 2,height:"10rem",borderRadius:3 }}>
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
