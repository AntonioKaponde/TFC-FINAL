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
        setValores([iva]);
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
        labels: ["IVA"],
        datasets: [
          {
            label: "Imposto",
            data: valores,
            backgroundColor: ["#ef4444"],
          },
        ],
      }}
    />
  );
}
