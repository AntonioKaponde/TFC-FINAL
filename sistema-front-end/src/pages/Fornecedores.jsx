import React from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import NovoFornecedor from "../components/NovoFornecedor";
import AddIcon from "@mui/icons-material/Add";
import TabelaFornecedor from "../components/TabelaFornecedor";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Link } from "react-router-dom";
import { obterRoles } from "../utils/authStorage";
export default function Fornecedores() {
  const userRoles = obterRoles();
  const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
  const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');
  const hideAdd = isOperador || isContabilista;

  return (
    <div>
      <NavBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box component={"main"} sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", md: "row" }, 
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
              mb: 3,
              gap: 2
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Fornecedor
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Gerencie todos os fornecedores da sua empresa.
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: { xs: "100%", sm: "auto" } }}
            >
              {!hideAdd && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ 
                    color: "#fff", 
                    background: "#083927", 
                    height: "40px",
                    width: { xs: "100%", sm: "auto" },
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    px: 2.5, 
                    boxShadow: 'none' 
                  }}
                >
                  <Link style={{textDecoration:"none", color: "inherit", width: "100%", textAlign: "center"}} to="/novoFornecedor">
                    Novo Fornecedor
                  </Link>
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{margin:"10px 0"}}>
            <TabelaFornecedor />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
