import React, { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS } from 'chart.js/auto'
import { Box, CircularProgress, Typography } from '@mui/material'
import { dashboardApi } from '../api'
import { ANO_REFERENCIA } from '../utils/formatters'

export default function Grafico() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    dashboardApi
      .comparativoMensal(ANO_REFERENCIA)
      .then(setDados)
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
    return <Typography color="error">{erro}</Typography>;
  }

  return (
    <Bar
      data={{
        labels: dados.map((d) => d.mes),
        datasets: [
          {
            label: "Lucros Retidos",
            data: dados.map((d) => d.lucro),
            backgroundColor: "#0B6E4F",
          },
          {
            label: "Imposto a Pagar(IVA,IRT)",
            data: dados.map((d) => d.imposto),
            backgroundColor: "#EF4444",
          },
        ],
      }}
    />
  );
}
