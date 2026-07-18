import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import { Box, Button, Card, CircularProgress, Divider, Grid, Typography, Snackbar, Alert } from '@mui/material'
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import PerfilEmpresa from '../components/PerfilEmpresa'
import ConfiguracoesFiscais from '../components/ConfiguracoesFiscais'
import SerieDocumentos from '../components/SerieDocumentos'
import { movimentosEstoqueApi } from '../api';

export default function Configuracoes() {
  const perfilRef = useRef(null);
  const fiscalRef = useRef(null);
  const serieRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [fixando, setFixando] = useState({ artigos: false, iva: false });
  const navigate = useNavigate();

  const rolesString = localStorage.getItem('userRoles');
  const userRoles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN');

  const handleCorrigirArtigos = async () => {
    setFixando(p => ({ ...p, artigos: true }));
    try {
      const resp = await movimentosEstoqueApi.corrigirArtigos();
      setSnackbar({ open: true, message: resp.mensagem || `Artigos corrigidos com sucesso!`, severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Erro ao corrigir artigos: ' + (e.response?.data?.message || e.message), severity: 'error' });
    } finally {
      setFixando(p => ({ ...p, artigos: false }));
    }
  };

  const handleRecalcularIva = async () => {
    setFixando(p => ({ ...p, iva: true }));
    try {
      const resp = await movimentosEstoqueApi.recalcularIva();
      setSnackbar({ open: true, message: resp.mensagem || `IVA recalculado com sucesso!`, severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Erro ao recalcular IVA: ' + (e.response?.data?.message || e.message), severity: 'error' });
    } finally {
      setFixando(p => ({ ...p, iva: false }));
    }
  };

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
          <Box component={"main"} sx={{margin:"90px 100px 0px 200px",display:"flex", width: "100%", paddingBottom: "50px"}}>
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
            {isAdmin && (
              <Grid sx={{ ml: 10, mt: 4 }}>
                {/*<Card sx={{ p: 3, maxWidth: '800px', bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BuildCircleOutlinedIcon sx={{ color: '#d97706' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e', fontSize: '1rem' }}>
                      Ferramentas de Manutenção (Admin)
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#92400e', mb: 2 }}>
                    Corrigir dados existentes (artigos com preço de custo = 0) e recalcular IVA dedutível
                    dos movimentos de stock registados anteriormente.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={handleCorrigirArtigos}
                      disabled={fixando.artigos}
                      sx={{ borderColor: '#d97706', color: '#92400e', textTransform: 'none', fontWeight: 600 }}
                    >
                      {fixando.artigos ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                      Corrigir Artigos (precoCusto=0 → null)
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleRecalcularIva}
                      disabled={fixando.iva}
                      sx={{ borderColor: '#0B6E4F', color: '#0B6E4F', textTransform: 'none', fontWeight: 600 }}
                    >
                      {fixando.iva ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                      Recalcular IVA Dedutível (movimentos)
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#92400e', mt: 2, display: 'block' }}>
                    ⚠️ Estas operações afetam dados existentes. Execute apenas se necessário.
                  </Typography>
                </Card>*/}
              </Grid>
            )}
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
