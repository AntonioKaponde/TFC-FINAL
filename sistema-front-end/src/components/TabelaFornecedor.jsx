import React, { useEffect, useMemo, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";

import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from "@mui/material/CircularProgress";
import { fornecedoresApi } from "../api";
import { labelEstadoCliente } from "../utils/formatters";
import { obterRoles } from "../utils/authStorage";

function getStatusColor(status) {
  switch (status) {
    case "Activo":
      return "success";
    case "Inativo":
      return "warning";
    default:
      return "default";
  }
}

export default function TabelaFornecedor() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 6;

  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos Fornecedores");

  const userRoles = obterRoles();
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const carregar = () => {
    setLoading(true);
    fornecedoresApi
      .listar()
      .then(setFornecedores)
      .finally(() => setLoading(false));
  };

  const handleRemoverClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      fornecedoresApi.remover(itemToDelete).then(() => {
        carregar();
        setNotification({ open: true, message: 'Fornecedor eliminado com sucesso!', severity: 'success' });
      }).catch((e) => {
        setNotification({ open: true, message: e.response?.data || "Erro ao eliminar o fornecedor.", severity: 'error' });
      }).finally(() => {
        setOpenDeleteDialog(false);
        setItemToDelete(null);
      });
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // Filtros locais — useMemo evita recalcular em cada render
  const fornecedoresFiltrados = useMemo(() => fornecedores.filter((fornecedor) => {
    // Text filter
    const search = pesquisa.toLowerCase();
    const matchPesquisa =
      !search ||
      (fornecedor.nome && fornecedor.nome.toLowerCase().includes(search)) ||
      (fornecedor.nif && fornecedor.nif.toLowerCase().includes(search)) ||
      (fornecedor.email && fornecedor.email.toLowerCase().includes(search));

    // Type filter
    let matchTipo = true;
    if (filtroTipo === "Ativos") matchTipo = fornecedor.ativo === true;
    if (filtroTipo === "Inativos") matchTipo = fornecedor.ativo === false;

    return matchPesquisa && matchTipo;
  }), [fornecedores, pesquisa, filtroTipo]);

  const { startIndex, endIndex, fornecedoresPaginados, totalPaginas } = useMemo(() => {
    const start = paginaAtual * itensPorPagina;
    const end = start + itensPorPagina;
    return {
      startIndex: start,
      endIndex: end,
      fornecedoresPaginados: fornecedoresFiltrados.slice(start, end),
      totalPaginas: Math.ceil(fornecedoresFiltrados.length / itensPorPagina),
    };
  }, [fornecedoresFiltrados, paginaAtual]);

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
    <Paper sx={{ boxShadow: "none", background: "transparent", width: "100%", minWidth: 0 }}>
      {/* Quick Filters */}
      <Box sx={{ marginTop: "20px" }}>
      </Box>

      {/* Search Input */}
      <Box sx={{ marginTop: "2px" }}>
      </Box>

      {/* Tabela */}
      <Box sx={{ mt: 2 }}>
        <Card sx={{ maxWidth: 2000, overflowX: "auto" }}>
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
                placeholder="Pesquisar por Nome, NIF, Email..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </Paper>

          </CardContent>
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
            <Box sx={{ display: "flex", gap: { xs: 1, sm: 5 } }}>
              {["Todos Fornecedores", "Ativos", "Inativos"].map((tipo) => (
                <Button
                  key={tipo}
                  variant="text"
                  onClick={() => setFiltroTipo(tipo)}
                  sx={{
                    color: filtroTipo === tipo ? "#0B6E4F" : "black",
                    textTransform: "none",
                    fontWeight: filtroTipo === tipo ? "bold" : "500",
                    minWidth: "auto",
                  }}
                >
                  {tipo}
                </Button>
              ))}
            </Box>
            {/*<Button
            disabled
              variant="text"
              sx={{ color: "black", textTransform: 'none', fontWeight: 600, px: 2.5 }}
            >
              <FileDownloadOutlinedIcon sx={{ mr: 1 }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Exportar</Box>
            </Button>*/}
          </CardContent>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                {["Fornecedor", "NIF", "Email", "Telefone", "Estado", "Ações"].map(
                  (head) => (
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
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} sx={{ color: '#0B6E4F' }} />
                  </TableCell>
                </TableRow>
              ) : fornecedoresPaginados.map((row) => {
                const estado = labelEstadoCliente(row.ativo);
                return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    <strong>{row.nome}</strong>
                    <br />
                    {row.endereco || '-'}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.nif}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.email}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.telefone}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={estado}
                      color={getStatusColor(estado)}
                      size="small"
                      sx={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <IconButton size="small">
                      <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small">
                      <CreateOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>

                    <IconButton size="small">
                      <MoreVertOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    {isAdmin && (
                      <IconButton size="small" onClick={() => handleRemoverClick(row.id)} color="error">
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );})}
            </TableBody>
          </Table>
          <Table sx={{ height: "10px" }}>
            <TableRow sx={{ display: "flex", justifyContent: "space-between" }}>
              <TableCell>
                <Typography variant="caption" color="textSecondary">
                  A mostrar {fornecedoresFiltrados.length > 0 ? startIndex + 1 : 0} a{" "}
                  {Math.min(endIndex, fornecedoresFiltrados.length)} de{" "}
                  {fornecedoresFiltrados.length} fornecedor(es)
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
        </Card>
      </Box>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja eliminar este fornecedor? Esta acção não pode ser desfeita.
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
