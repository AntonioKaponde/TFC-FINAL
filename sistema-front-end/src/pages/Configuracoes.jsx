import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import { Box, Button, CircularProgress, Grid, Typography, Snackbar, Alert } from '@mui/material'
import PerfilEmpresa from '../components/PerfilEmpresa'
import ConfiguracoesFiscais from '../components/ConfiguracoesFiscais'
import SerieDocumentos from '../components/SerieDocumentos'

export default function Configuracoes() {
  const perfilRef = useRef(null);
  const fiscalRef = useRef(null);
  const serieRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all([
        perfilRef.current?.save(),
        fiscalRef.current?.save(),
        serieRef.current?.save()
      ]);
      setSnackbar({ open: true, message: "Todas as configurações foram guardadas com sucesso!", severity: "success" });
      setTimeout(() => {
        navigate('/resumo-empresa');
      }, 1500);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: "Ocorreu um erro ao guardar as configurações.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div>
        <NavBar />
        <Box  display={"flex"}>
          <SideBar />
          <Box component={"main"} sx={{margin:"90px 90px",display:"flex", width: "100%", paddingBottom: "50px"}}>
           <Grid container spacing={2} sx={{display:"flex", flexDirection:"column"}}>
            <Grid sx={{ml:10}}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }} >Definições Gerais</Typography>
              <Typography variant="caption" color="textSecondary">Faça a gestão dos dados da sua empresa, configurações fiscais e parametrização fiscal</Typography>
            </Grid>
            {/**componentes da esquerda e direita  */}
            <Grid>
              <PerfilEmpresa ref={perfilRef} />
            </Grid>
            <Grid>
              <ConfiguracoesFiscais ref={fiscalRef} />
            </Grid>
            <Grid>
              <SerieDocumentos ref={serieRef} />
            </Grid>
            <Grid sx={{ display: "flex", justifyContent: "flex-end", mt: 4, ml: 10, width: "60em" }}>
               <Button 
                 variant="contained" 
                 onClick={handleSaveAll}
                 disabled={saving}
                 sx={{ bgcolor: "#0B6E4F", color: "#fff", textTransform: "none", px: 4, py: 1.5, fontWeight: "bold" }}
               >
                 {saving ? <CircularProgress size={24} color="inherit" /> : "Guardar Todas as Alterações"}
               </Button>
            </Grid>
           </Grid>
          </Box>
        </Box>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
    </div>
  )
}
