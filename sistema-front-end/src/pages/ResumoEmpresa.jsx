import React, { useState, useEffect } from 'react';
import { Box, Card, Divider, Grid, Typography, CircularProgress, Chip } from '@mui/material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import { obterRoles } from '../utils/authStorage';

export default function ResumoEmpresa() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userRoles = obterRoles();
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
    const isGerente = userRoles.some(r => r.toUpperCase() === 'GERENTE');

    if (isOperador || isGerente) {
      navigate('/faturacao');
      return;
    }
    const fetchEmpresa = async () => {
      try {
        const response = await api.get('/api/empresa/atual');
        setEmpresa(response);
      } catch (error) {
        console.error("Erro ao buscar resumo da empresa", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, []);

  if (loading) {
    return (
      <div>
        <NavBar />
        <Box display={"flex"}>
          <SideBar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, md: 4 },
              mt: '70px',
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh'
            }}
          >
            <CircularProgress />
          </Box>
        </Box>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div>
        <NavBar />
        <Box display={"flex"}>
          <SideBar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
              p: { xs: 2, md: 4 },
              mt: '70px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Typography>Nenhuma empresa encontrada ou erro ao carregar.</Typography>
          </Box>
        </Box>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <Box display={"flex"}>
        <SideBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: { xs: 2, md: 4 },
            mt: '70px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Grid container spacing={2} sx={{ display: "flex", flexDirection: "column" }}>
            <Grid sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: 1 }}>
               Resumo da Empresa
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Visão geral de todas as informações cadastrais e atualizadas da sua empresa.
              </Typography>
            </Grid>

            <Grid item>
              <Card sx={{ p: { xs: 2, md: 4 }, width: "100%", borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#083927' }}>
                      {empresa.nome}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      NIF: {empresa.nif} <VerifiedUserIcon sx={{ fontSize: 16, color: '#10B981' }} />
                    </Typography>
                  </Box>
                  <Chip label="Ativa" color="success" size="small" sx={{ fontWeight: 600 }} />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={4}>
                  {/* Coluna 1: Informações Gerais */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Informações de Contacto e Sede
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Endereço Sede</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>{empresa.endereco || 'Não definido'}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Telefone</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>{empresa.telefone || 'Não definido'}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>E-mail de Conta</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>{empresa.email || 'Não definido'}</Typography>
                    </Box>
                  </Grid>

                  {/* Coluna 2: Informações Fiscais e Jurídicas */}
                  <Grid item xs={12} md={6} >
                    <Typography variant="subtitle2" sx={{fontWeight: 700, color: '#1e293b', mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Informações Fiscais e Jurídicas
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Tipo de Empresa</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>{empresa.empresa || 'Não definido'}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Capital Social</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>
                        {empresa.capitalSocial ? `${Number(empresa.capitalSocial).toLocaleString('pt-AO')} Kz` : 'Não definido'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Regime de IVA</Typography>
                      <Typography variant="body1" sx={{ color: '#0F172A' }}>
                        <Chip label={empresa.regimeIva || 'Não definido'} size="small" variant="outlined" sx={{ mt: 0.5, borderColor: '#083927', color: '#083927' }} />
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}>
                      {empresa.industrial && <Chip label="Selo Industrial" size="small" sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }} />}
                      {empresa.retencaoNaFonte && <Chip label="Sujeito a Retenção" size="small" sx={{ bgcolor: '#FEF2F2', color: '#B91C1C', fontWeight: 600 }} />}
                      {empresa.iva && <Chip label="IVA Aplicável" size="small" sx={{ bgcolor: '#F0FDF4', color: '#15803D', fontWeight: 600 }} />}
                    </Box>
                  </Grid>
                </Grid>

              </Card>
            </Grid>

          </Grid>
        </Box>
      </Box>
    </div>
  );
}
