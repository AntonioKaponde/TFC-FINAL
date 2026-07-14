import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Stack,
  Paper,
  Typography,
  Card,
  CardContent,
  InputBase,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";

import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from "@mui/material/CircularProgress";
import { artigosApi } from "../api";
import { formatKzSemPrefixo, labelEstadoArtigo } from "../utils/formatters";

function getStatusColor(status) {
  switch (status) {
    case "Em Stock":
      return "success";
    case "Stock Baixo":
      return "warning";
    case "Sem Stock":
      return "error";
    default:
      return "default";
  }
}

export default function TabelaInventario({ onMovimentar, refreshKey }) {
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 5;

  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos os Artigos");

  const rolesString = localStorage.getItem('userRoles');
  const userRoles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const carregar = () => {
    setLoading(true);
    artigosApi
      .listar("")
      .then(setArtigos)
      .finally(() => setLoading(false));
  };

  const handleRemoverClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      artigosApi.remover(itemToDelete).then(() => {
        carregar();
        setNotification({ open: true, message: 'Artigo eliminado com sucesso!', severity: 'success' });
      }).catch((e) => {
        setNotification({ open: true, message: e.response?.data || "Erro ao eliminar o artigo.", severity: 'error' });
      }).finally(() => {
        setOpenDeleteDialog(false);
        setItemToDelete(null);
      });
    }
  };

  useEffect(() => {
    carregar();
  }, [refreshKey]);

  // Filtros locais
  const artigosFiltrados = artigos.filter((artigo) => {
    // Text filter
    const search = pesquisa.toLowerCase();
    const matchPesquisa =
      !search ||
      (artigo.nome && artigo.nome.toLowerCase().includes(search)) ||
      (artigo.codigo && artigo.codigo.toLowerCase().includes(search)) ||
      (artigo.categoria && artigo.categoria.toLowerCase().includes(search));

    // Type filter
    let matchTipo = true;
    if (filtroTipo === "Produtos Físicos") matchTipo = artigo.stock !== null;
    if (filtroTipo === "Serviços") matchTipo = artigo.stock === null;
    // se for categorias, pode ser uma view diferente, mas para já filtramos tudo
    
    return matchPesquisa && matchTipo;
  });

  const startIndex = paginaAtual * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const artigosPaginados = artigosFiltrados.slice(startIndex, endIndex);
  const totalPaginas = Math.ceil(artigosFiltrados.length / itensPorPagina);

  const handleAnterior = () => {
    if (paginaAtual > 0) setPaginaAtual((p) => p - 1);
  };
  const handleProximo = () => {
    if (paginaAtual < totalPaginas - 1) setPaginaAtual((p) => p + 1);
  };

  useEffect(() => {
    setPaginaAtual(0);
  }, [pesquisa, filtroTipo]);

  return (
    <Paper sx={{ width:"83rem",ml:9, boxShadow: "none", background: "transparent", }}>
      {/* Tabela */}
      <Box sx={{ marginTop: "20px" }}>
        <Card sx={{p: 1, width: "83rem" }}>
          <CardContent
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 5 },
              height: { xs: "auto", sm: "40px" },
              alignItems: "center",
              justifyContent: "space-between",
              overflowX: "auto",
              whiteSpace: "nowrap",
              py: { xs: 1, sm: 2 }
            }}
          >
            {["Todos os Artigos", "Produtos Físicos", "Serviços", "Categorias"].map((tipo) => (
              <Button
                key={tipo}
                variant="text"
                onClick={() => setFiltroTipo(tipo)}
                sx={{
                  color: filtroTipo === tipo ? "#0B6E4F" : "black",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: filtroTipo === tipo ? "bold" : "500",
                  minWidth: "auto",
                }}
              >
                {tipo}
              </Button>
            ))}
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ marginTop: "2px" }}>
        <Card sx={{ maxWidth: 2000 }}>
          <CardContent
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 5 },
              height: "50px",
              alignItems: "center",
            }}
          >
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 350 },
                background: "#F4F7F9",
                height: "30px",
              }}
            >
              <IconButton sx={{ p: "10px" }} aria-label="menu">
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Pesquisar por Código, Nome..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </Paper>
            <Button
              variant="outlined"
              sx={{
                background: "#F4F7F9",
                color: "black",
                border: " 1px solid #262a2c1e",
                height: "30px",
                textTransform: "none",
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              {" "}
              <FilterAltOutlinedIcon /> Filtrar por Categoria
            </Button>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
      <Table sx={{ minWidth: 750, bgcolor: 'white' }}>
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            {[
              "Artigo",
              "Categoria",
              "Preço(Kz)",
              "Imposto",
              "Stock",
              "Estado",
              "Ações",
            ].map((head) => (
              <TableCell
                key={head}
                sx={{
                  fontWeight: "600",
                  color: "#64748b",
                  fontSize: "0.75rem",
                }}
              >
                {head}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <CircularProgress size={28} sx={{ color: "#0B6E4F" }} />
              </TableCell>
            </TableRow>
          ) : artigosPaginados.map((row) => {
              const estado = labelEstadoArtigo(row.estado);
              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: "0.85rem", fontWeight: "500" }}>
                    <Avatar variant="square" sx={{ fontSize: ".90rem" }}>
                      {row.nome.charAt(0)}
                    </Avatar>{" "}
                    {row.nome}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.categoria}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {formatKzSemPrefixo(row.preco)}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    IVA {row.taxaIva}%
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.stock != null ? `${row.stock} un.` : "-"}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    <Chip
                      label={estado}
                      color={getStatusColor(estado)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    <IconButton size="small">
                      <CreateOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    <IconButton size="small" onClick={() => onMovimentar && onMovimentar(row.id)}>
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    <IconButton size="small">
                      <MoreVertOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    {/**{isAdmin && (
                      <IconButton size="small" onClick={() => handleRemoverClick(row.id)} color="error">
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )} */}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <Table sx={{ height: "10px" }}>
        <TableRow sx={{ display: "flex", justifyContent: "space-between" }}>
          <TableCell>
            <Typography variant="caption" color="textSecondary">
              A mostrar {artigosFiltrados.length > 0 ? startIndex + 1 : 0} a{" "}
              {Math.min(endIndex, artigosFiltrados.length)} de{" "}
              {artigosFiltrados.length} artigo(s)
            </Typography>
          </TableCell>
          <TableCell sx={{ display: "flex", gap: 2, height: "60px" }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={handleAnterior}
                disabled={paginaAtual === 0}
                sx={{ textTransform: "none" }}
              >
                Anterior
              </Button>
              <Button
                size="small"
                onClick={handleProximo}
                disabled={paginaAtual >= totalPaginas - 1 || totalPaginas === 0}
                sx={{ textTransform: "none" }}
              >
                Próximo
              </Button>
            </Stack>
          </TableCell>
        </TableRow>
      </Table>
      </Box>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja eliminar este artigo? Esta acção não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
