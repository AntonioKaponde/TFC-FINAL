import React from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SourceIcon from "@mui/icons-material/Source";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import TabelaFatura from "../components/TabelaFatura"
import CardFatura from "../components/CardFatura"
import { Link } from "react-router-dom";
import { exportarPDF } from "../utils/pdfExport";

export default function Faturacao() {
  return (
    <div>
      <NavBar />
      <Box sx={{ display: "flex"}}>
        <SideBar />
        <Box id="area-impressao" component={"main"} sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", md: "row" }, 
              ml: 10,  
              mb: 3,
              gap: 2
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Documentos Comerciais</Typography>
              <Typography variant="caption" color="textSecondary">
                Faça a gestão de todas as faturas, recibos e orçamentos do seu negócio.
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: { xs: "100%", sm: "auto" },ml: { xs: 0, sm: "29rem" } }}
            >
              <Button
                onClick={() => exportarPDF('area-impressao', 'Faturacao')}
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                sx={{ 
                  background: "#F7FAFC", 
                  color: "black",
                  width: { xs: "100%", sm: "215px" },
                  height: "40px",
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 2.5 
                }}
              >
                Exportar PDF
              </Button>
              <Button
                component={Link}
                to="/venda"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ 
                  color: "#fff", 
                  background: "#0B6E4F", 
                  width: { xs: "100%", sm: "215px" },
                  height: "40px", 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 2.5, 
                  boxShadow: 'none', 
                  textDecoration: 'none' 
                }}
              >
                Nova Fatura
              </Button>
            </Box>
          </Box>
          <Box>
              <CardFatura/>
          </Box>
          <Box>
              <TabelaFatura/>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
