import React, { useState, useCallback } from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import { Box, Button,Typography } from "@mui/material";
import CardInventario from "../components/CardInventario";
import TabelaInventario from "../components/TabelaInventario";
import MovimentoStockModal from "../components/MovimentoStockModal";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { exportarPDF } from "../utils/pdfExport";

export default function Inventário() {
  const [modalMovimentoAberta, setModalMovimentoAberta] = useState(false);
  const [artigoMovimentar, setArtigoMovimentar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const abrirModalMovimento = useCallback((artigoId) => {
    setArtigoMovimentar(artigoId);
    setModalMovimentoAberta(true);
  }, []);

  const fecharModalMovimento = useCallback(() => {
    setModalMovimentoAberta(false);
    setArtigoMovimentar(null);
  }, []);

  const aoSucessoMovimento = useCallback(() => {
    setRefreshKey(k => k + 1);
    fecharModalMovimento();
  }, [fecharModalMovimento]);

  const rolesString = localStorage.getItem('userRoles');
  const userRoles = rolesString ? JSON.parse(rolesString) : [];
  const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
  const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');
  const hideAdd = isOperador || isContabilista;

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
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Produtos e Serviços
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Faça a gestão de todas as faturas, recibos e orçamentos do seu negócio.
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: { xs: "100%", sm: "auto" },ml: { xs: 0, sm: "29rem" } }}
            >
              {/*<Button
                onClick={() => exportarPDF('area-impressao', 'Inventario')}
                disabled
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                sx={{
                  background: "#F7FAFC",
                  color: "black",
                  width: { xs: "100%", sm: "215px" },
                  height: "40px",
                  borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5
                }}
              >
                Exportar PDF
              </Button>*/}
              {!hideAdd && (
                <Button
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
                    ml:29
                  }}
                >
                  <Link style={{ textDecoration: "none", color: "inherit", width: "100%", textAlign: "center" }} to="/novoArtigo">
                    Novo Artigo
                  </Link>
                </Button>
              )}
            </Box>
          </Box>
          <Box>
            <CardInventario />
          </Box>
          <Box>
            <TabelaInventario onMovimentar={abrirModalMovimento} refreshKey={refreshKey} />
          </Box>
        </Box>
      </Box>

      <MovimentoStockModal
        open={modalMovimentoAberta}
        onClose={fecharModalMovimento}
        onSucesso={aoSucessoMovimento}
        artigoId={artigoMovimentar}
      />
    </div>
  );
}
