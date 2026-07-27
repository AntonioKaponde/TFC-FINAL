import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NovoCliente from '../components/NovoCliente'
import { Box,Stack, Typography } from '@mui/material'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import  CardFicheiro from '../components/CardFicheiro'

import TabelaFicheiro from '../components/TabelaFicheiro'

export default function Ficheiro() {
  const navigate = useNavigate();

  useEffect(() => {
    const rolesString = localStorage.getItem('userRoles');
    const userRoles = rolesString ? JSON.parse(rolesString) : [];
    const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
    const isGerente = userRoles.some(r => r.toUpperCase() === 'GERENTE');

    if (isOperador || isGerente) {
      navigate('/faturacao');
    }
  }, [navigate]);

  return (
    <div>
      <NavBar />
     <Box sx={{display:"flex"}}>
        <SideBar />
        <Box component= "main" sx={{ flexGrow: "1", mt:15, ml:13 }}>
          <Stack>
            <Box sx={{ ml:1 }}>
              <Typography variant="h6" fontWeight={"bold"}>
                Ficheiro SAF-T (AO)
              </Typography>
              <Typography variant="subTitle1">
                <Typography variant="caption" color="textSecondary">
                  Geração do ficheiro normalizado de faturação exigido pela Administração Geral Tributária(AGT).
                </Typography>
              </Typography>
            </Box>
            {/*Renderizando os dados dos cards */}
            <CardFicheiro />
            {/*Renderizando os dados doa tabela */}
            <TabelaFicheiro />
          </Stack>
        </Box>
     </Box>
    </div>
  )
}
