import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import { artigosApi } from "../api";
import { formatKz } from "../utils/formatters";

export default function CardInventario() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artigosApi.listar().then((artigos) => {
      const stockBaixo = artigos.filter((a) => a.estado === 'STOCK_BAIXO').length;
      const semStock = artigos.filter((a) => a.estado === 'SEM_STOCK').length;
      const valorStock = artigos.reduce((s, a) => s + Number(a.preco) * a.stock, 0);
      setStats({ total: artigos.length, stockBaixo, semStock, valorStock });
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
    { titulo: 'Total de Artigos', valor: stats.total, icon: <ViewInArOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} /> },
    { titulo: 'Stock Baixo', valor: stats.stockBaixo, icon: <ReportGmailerrorredOutlinedIcon sx={{ color: "orange", fontSize: '2rem' }} /> },
    { titulo: 'Sem Stock', valor: stats.semStock, icon: <HighlightOffOutlinedIcon sx={{ color: "red", fontSize: '2rem' }} />, cor: 'red' },
    { titulo: 'Valor em Stock', valor: formatKz(stats.valorStock), icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: '2rem', color: '#64748b' }} /> },
  ];

  return (
    <div style={{ display: "flex", gap: 23, justifyContent: "center" }}>
      {cards.map((card) => (
        <Box key={card.titulo}>
          <Card sx={{ minWidth: 336, p: 2 ,height:"10rem",borderRadius:3}}>
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
