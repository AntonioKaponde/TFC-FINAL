import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { dashboardApi } from "../api";
import { ANO_REFERENCIA } from "../utils/formatters";

export default function DoughnutRelatorio({ valores: valoresProp }) {
  const [valores, setValores] = useState(valoresProp ?? null);
  const [loading, setLoading] = useState(!valoresProp);

  useEffect(() => {
    if (valoresProp) {
      setValores(valoresProp);
      setLoading(false);
      return;
    }
    dashboardApi
      .indicadores(ANO_REFERENCIA)
      .then((data) => {
        const iva = Number(data.ivaAPagar);
        const irt = Number(data.irtRetido ?? 0);
        const total = Number(data.totalImpostos ?? 0);
        setValores([iva, irt, Math.max(0, total - iva - irt)]);
      })
      .finally(() => setLoading(false));
  }, [valoresProp]);

  if (loading || !valores) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  return (
    <Doughnut
      data={{
        labels: ["IVA", "IRT", "Outros Impostos"],
        datasets: [
          {
            label: "Imposto",
            data: valores.length === 3 ? valores : [...valores, 0],
            backgroundColor: ["#9b2e03b6", "#ee9906", "#f59e0b"],
          },
        ],
      }}
    />
  );
}
