import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import { clientesApi } from "../api";
import { formatKz } from "../utils/formatters";

export default function CardCliente() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientesApi.listar().then((clientes) => {
      const ativos = clientes.filter((c) => c.ativo).length;
      const comDivida = clientes.filter((c) => Number(c.saldo) > 0);
      const totalDivida = comDivida.reduce((s, c) => s + Number(c.saldo), 0);
      setStats({
        total: clientes.length,
        ativos,
        comDivida: comDivida.length,
        totalDivida,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  const cards = [
    { titulo: 'Total de Clientes', valor: stats.total, icon: <PeopleAltOutlinedIcon sx={{ fontSize: '2rem' }} /> },
    { titulo: 'Clientes Ativos', valor: stats.ativos, icon: <PermIdentityOutlinedIcon sx={{ color: "green", fontSize: '2rem' }} /> },
    { titulo: 'Clientes com Dívidas', valor: stats.comDivida, icon: <ReportGmailerrorredOutlinedIcon sx={{ color: "orange", fontSize: '2rem' }} />, cor: 'orange' },
    { titulo: 'Total em Dívida', valor: formatKz(stats.totalDivida), icon: <AccountBalanceWalletOutlinedIcon sx={{ color: "red", fontSize: '2rem' }} /> },
  ];

  return (
    <div style={{ display: "flex", gap: 23, justifyContent: "center" }}>
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ minWidth: 335, p: 2,height:"10rem",borderRadius:3 }}>
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
