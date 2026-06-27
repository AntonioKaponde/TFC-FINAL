import React, { useState } from 'react'
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import { Box, Button, Card, Grid, Typography, CircularProgress, Snackbar, Alert } from '@mui/material'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CardDashboard from '../components/CardDashboard';
import GraficosDashboard from '../components/GraficosDashboard';
import { saftApi } from '../api';

export default function Dashboard() {
  const [loadingSaft, setLoadingSaft] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleGerarSaft = () => {
    const hoje = new Date();
    // Mês anterior (1 a 12). getDate().getMonth() retorna 0-11
    let mesAnterior = hoje.getMonth(); 
    let ano = hoje.getFullYear();
    if (mesAnterior === 0) {
      mesAnterior = 12;
      ano -= 1;
    }

    setLoadingSaft(true);
    saftApi.exportar(ano, mesAnterior)
      .then(() => {
        showMessage(`SAF-T do mês ${mesAnterior}/${ano} gerado com sucesso!`, 'success');
      })
      .catch((error) => {
        console.error(error);
        showMessage('Erro ao gerar SAF-T. Tente novamente mais tarde.', 'error');
      })
      .finally(() => setLoadingSaft(false));
  };

  return (
    <div>
         <NavBar />
        <Box  display={"flex"}>
          <SideBar />
        <Box component={"main"} sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{
                  bgcolor:"#0B6E4F",
                  display:"flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent:"space-between",
                  p:3,
                  width: "150%",
                  gap: { xs: 2, md: 0 },
                  mb: 3,
                  ml: 8,
                  alignItems: "center",
                }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Obrigações Fiscais em dia</Typography>
                    <Typography sx={{fontSize:"0.9em",color:"#ffffff88"}}>O seu ficheiro SAF-T (AO) referente ao mês passado está pronto para ser submetido.</Typography>
                  </Box>
                  <Box>
                    <Button 
                      variant='outlined' 
                      onClick={handleGerarSaft}
                      disabled={loadingSaft}
                      sx={{bgcolor:"#fff",color:"black", borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none'}}
                    >
                      {loadingSaft ? <CircularProgress size={20} color="inherit" sx={{mr:1}} /> : <UploadFileOutlinedIcon sx={{mr:1}} />}
                      {loadingSaft ? 'A Gerar...' : 'Gerar SAF-T (Angola)'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{mt:2}}>
              <CardDashboard />
            </Box>
            <Box sx={{mt:2}}>
              <GraficosDashboard />
            </Box>
          </Box>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </div>
  )
}
