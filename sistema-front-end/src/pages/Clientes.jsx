import React from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import CardCliente from "../components/CardCliente";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import Card from "@mui/material/Card";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SourceIcon from "@mui/icons-material/Source";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import TabelaCliente from "../components/TabelaClientes";
import { Radio } from "@mui/material";
import TabelaClientes from "../components/TabelaClientes";
import { Link } from "react-router-dom";
import { obterRoles } from "../utils/authStorage";
import { ehGestorEstoque } from "../utils/roles";

export default function Clientes() {
  const userRoles = obterRoles();
  const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');
  const hideNovoCliente = isContabilista || ehGestorEstoque(userRoles);

  return (
    <div>
      <NavBar />
      <Box sx={{ display: "flex"}}>
        <SideBar />
        <Box id="area-impressao" component={"main"} sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
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
                Gestão de Clientes
              </Typography>
              <Typography variant="caption" color="textSecondary">
                  Faça a gestão dos seus clientes empresariais e particulares
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: { xs: "100%", sm: "auto" } }}
            >
              {/*<Button
                onClick={() => exportarPDF('area-impressao', 'Clientes')}
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                sx={{
                  background: "#F7FAFC",
                  color: "black",
                  width: { xs: "100%", sm: "215px" },
                  height: "40px",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Exportar PDF
              </Button> */}
              {!hideNovoCliente && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    color: "#fff",
                    background: "#083927",
                    width: { xs: "100%", sm: "215px" },
                    height: "40px",
                    boxShadow: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  <Link style={{textDecoration:"none", color: "inherit", width: "100%", textAlign: "center"}} to="/novoCliente">
                    Novo Cliente
                  </Link>
                </Button>
              )}
            </Box>
          </Box>
          {/**Cartões que mostram dados clientes */}
          <Box>
            <CardCliente />
          </Box>
          <Box>
            {/**Tabela Clientes */}
            <TabelaClientes />
          </Box>
        </Box>
      </Box>
    </div>
  );
}
