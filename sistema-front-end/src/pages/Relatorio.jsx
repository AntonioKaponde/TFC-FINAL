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

import { exportarPDF, imprimirPagina } from '../utils/pdfExport';

export default function Relatorio() {
  const navigate = useNavigate();

  useEffect(() => {
    const rolesString = localStorage.getItem('userRoles');
    const userRoles = rolesString ? JSON.parse(rolesString) : [];
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');

    if (isOperador) {
      navigate('/faturacao');
    }
  }, [navigate]);

  return (
    <div>
         <NavBar />
        <Box  display={"flex"}>
          <SideBar />
          <Box id="area-impressao" component={"main"} sx={{margin:"90px 0 30px 0",ml:11}}>
            <Box component={"div"} sx={{ display: "flex",m:"10px 0" }}>
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
              sx={{p:"20px 10px", display: "flex", gap: 2,ml:36}}
            >
              <Button
                onClick={imprimirPagina}
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
              </Button>
              <Button
                onClick={() => exportarPDF('area-impressao', 'Relatorio_Impostos')}
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                sx={{ borderRadius: 2, width: "215px",
                  height: "40px",textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#0B6E4F"}}
              >
               Exportar PDF
              </Button>
            </Box>
          </Box>
           <Grid container spacing={2} >
            <Grid>
              <CardRelatorio />
            </Grid>
            <Grid sx={{display:"flex",gap:3}}>
             <Card sx={{p:3,width:"60rem"}}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Comparativo: Carga Fiscal vs Lucros Retidos</Typography>
              <Typography variant="caption" color="textSecondary">Evolução dos últimos <span>6</span> meses [Valores em Mihões de Kz]</Typography>
               <GraficoRelatorio />
             </Card>
             <Box>
              <FiscalRelatorio />
             </Box>
            </Grid>
            <Grid>
              <TabelaRelatorio />
            </Grid>
          </Grid>
          </Box>
        </Box>
    </div>
  )
}
