import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  Stack,
  CardContent,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from "@mui/material/CircularProgress";
import { clientesApi } from "../api";
import { formatKzSemPrefixo, labelEstadoCliente } from "../utils/formatters";

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

export default function TabelaClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 5;

  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos Clientes");

  const rolesString = localStorage.getItem('userRoles');
  const userRoles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const carregar = () => {
    setLoading(true);
    clientesApi
      .listar("")
      .then(setClientes)
      .finally(() => setLoading(false));
  };

  const handleRemoverClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      clientesApi.remover(itemToDelete).then(() => {
        carregar();
        setNotification({ open: true, message: 'Cliente eliminado com sucesso!', severity: 'success' });
      }).catch((e) => {
        setNotification({ open: true, message: e.response?.data || "Erro ao eliminar o cliente.", severity: 'error' });
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
  const clientesFiltrados = useMemo(() => clientes.filter((cliente) => {
    // Text filter
    const search = pesquisa.toLowerCase();
    const matchPesquisa =
      !search ||
      (cliente.nome && cliente.nome.toLowerCase().includes(search)) ||
      (cliente.nif && cliente.nif.toLowerCase().includes(search)) ||
      (cliente.email && cliente.email.toLowerCase().includes(search)) ||
      (cliente.empresa && cliente.empresa.toLowerCase().includes(search));

    // Type filter
    let matchTipo = true;
    if (filtroTipo === "Empresas (B2B)")
      matchTipo = cliente.empresa === "Empresa";
    if (filtroTipo === "Particulares(B2C)")
      matchTipo = cliente.empresa === "Particular" || !cliente.empresa || cliente.empresa === "";
    if (filtroTipo === "Com Dívida") matchTipo = cliente.saldo > 0;

    return matchPesquisa && matchTipo;
  }), [clientes, pesquisa, filtroTipo]);

  const { startIndex, endIndex, clientesPaginados, totalPaginas } = useMemo(() => {
    const start = paginaAtual * itensPorPagina;
    const end = start + itensPorPagina;
    return {
      startIndex: start,
      endIndex: end,
      clientesPaginados: clientesFiltrados.slice(start, end),
      totalPaginas: Math.ceil(clientesFiltrados.length / itensPorPagina),
    };
  }, [clientesFiltrados, paginaAtual]);

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
    <Box
      sx={{
        fontFamily: "Inter, sans-serif",
        mt:3,
       ml:9
      }}
    >
      <Grid container spacing={3}>
        {/* TABELA DE HISTÓRICO */}
        <Grid item xs={12}>
          <Card sx={{ overflow: "hidden", width: "100%" }}>
            <Box>
              <Card>
                <CardContent
                  sx={{
                    display: "flex",
                    gap: 5,
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
                      width: "73rem",
                      background: "#F4F7F9",
                      height: "30px"
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
                  <Button
                    variant="outlined"
                    sx={{
                      background: "#F4F7F9",
                      color: "black",
                      border: " 1px solid #262a2c1e",
                      height: "30px",
                      textTransform: "none",
                      display: { xs: "none", sm: "flex" } // Hide filters on very small screens for now or just let it wrap
                    }}
                  >
                    {" "}
                    <FilterAltOutlinedIcon /> Filtros
                  </Button>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent
                  sx={{
                    display: "flex",
                    gap: { xs: 1, sm: 5 },
                    height: { xs: "auto", sm: "40px" },
                    alignItems: "center",
                    justifyContent: { xs: "flex-start", sm: "space-between" },
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                    py: { xs: 1, sm: 2 }
                  }}
                >
                  {["Todos Clientes", "Empresas (B2B)", "Particulares(B2C)", "Com Dívida"].map((tipo) => (
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
                </CardContent>
              </Card>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    {[
                      "Cliente",
                      "NIF",
                      "Telefone",
                      "Email",
                      "Saldo/Dívida",
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
                  ) : clientesPaginados.map((row) => {
                      const estado = labelEstadoCliente(row.ativo);
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell
                            sx={{ fontSize: "0.85rem", fontWeight: "500" }}
                          >
                            <strong>{row.nome}</strong>
                            <br />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                              {row.codigoCliente || 'C-000000'}
                            </Typography>
                            {row.empresa && (
                              <>
                                <br />
                                {row.empresa}
                              </>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                            {row.nif}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                            {row.telefone}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                            {row.email}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                            {formatKzSemPrefixo(row.saldo)} kz
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: "500",
                              color: "#64748b",
                            }}
                          >
                            <Chip
                              label={estado}
                              color={getStatusColor(estado)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton size="small">
                                <EditOutlinedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                              {row.id === -1 ? (
                                <IconButton
                                  size="small"
                                  sx={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 1,
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              ) : (
                                <IconButton size="small">
                                  <MoreVertIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                              {isAdmin && (
                                <IconButton size="small" onClick={() => handleRemoverClick(row.id)} color="error">
                                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <Typography variant="caption" color="textSecondary">
                A mostrar {clientesFiltrados.length > 0 ? startIndex + 1 : 0} a{" "}
                {Math.min(endIndex, clientesFiltrados.length)} de{" "}
                {clientesFiltrados.length} cliente(s)
              </Typography>
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
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja eliminar este cliente? Esta acção não pode ser desfeita.
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
    </Box>
  );
}
