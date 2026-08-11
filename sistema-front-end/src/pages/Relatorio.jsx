import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import { Box, Button, Card, FormControl, Grid, MenuItem, Select, Typography } from '@mui/material'
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CardRelatorio from '../components/CardRelatorio';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import GraficoRelatorio from '../components/GraficoRelatorio';
import FiscalRelatorio from '../components/FiscalRelatorio';
import TabelaRelatorio from '../components/TabelaRelatorio';
import { dashboardApi } from '../api';
import { obterRoles } from '../utils/authStorage';

export default function Relatorio() {
  const navigate = useNavigate();

  useEffect(() => {
    const userRoles = obterRoles();
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
    const isGerente = userRoles.some(r => r.toUpperCase() === 'GERENTE');

    if (isOperador || isGerente) {
      navigate('/faturacao');
    }
  }, [navigate]);

  const handleExportarPDF = async () => {
    try {
      const ano = new Date().getFullYear();
      await dashboardApi.baixarRelatorioImpostosPdf(ano);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert(`Ocorreu um erro ao exportar o PDF: ${error.message}`);
    }
  };


  return (
    <div>
         <NavBar />
        <Box  display={"flex"}>
          <SideBar />
          <Box
            id="area-impressao"
            component={"main"}
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, md: 4 },
              mt: '70px',
              pb: '30px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Box
              component="div"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                gap: 2,
                m: "10px 0"
              }}
            >
            <Box sx={{ m: "20px 0 20px 0" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Imposto a Pagar vs. Lucros
              </Typography>
              <Typography variant="subTitle1">
                <Typography variant="caption" color="textSecondary">
                 Análise a carga fiscal sobre o seu negócio,retenções na fonte e IVA a liquidar junto da AGT
                </Typography>
              </Typography>
            </Box>
            <Box
              sx={{ p: { xs: "0 0 10px 0", md: "20px 10px" }, display: "flex", gap: 2 }}
            >
              {/*<Button
                onClick={handleExportarPDF}
                variant="contained"
                startIcon={<PrintOutlinedIcon />}
                sx={{
                  background: "#F7FAFC",
                  color: "black",
                  width: "215px",
                  height: "40px",
                  marginLeft: "120px",
                  borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5
                }}
              >
               Imprimir
              </Button>*/}
              <Button
                onClick={handleExportarPDF}
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                sx={{ borderRadius: 2, width: { xs: "100%", sm: "215px" },
                  height: "40px",textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#083927"}}
              >
               Exportar PDF
              </Button>
            </Box>
          </Box>
           <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mt: 1 }}>
              <CardRelatorio />
            <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, width: "100%" }}>
             <Card sx={{ p: 3, flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Comparativo: Carga Fiscal vs Lucros Retidos</Typography>
              <Typography variant="caption" color="textSecondary">Evolução dos últimos <span>6</span> meses [Valores em Mihões de Kz]</Typography>
               <GraficoRelatorio />
             </Card>
             <Box sx={{ width: { xs: "100%", lg: "24rem" }, flexShrink: 0 }}>
              <FiscalRelatorio />
             </Box>
            </Box>
              <TabelaRelatorio />
          </Box>
          </Box>
        </Box>
    </div>
  )
}
