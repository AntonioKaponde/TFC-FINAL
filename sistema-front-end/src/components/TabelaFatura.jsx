import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider
} from "@mui/material";

import Card from "@mui/material/Card";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CardContent from "@mui/material/CardContent";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CircularProgress from "@mui/material/CircularProgress";
import { faturasApi, notasCreditoApi } from "../api";
import { formatData, formatKzSemPrefixo, labelEstadoFatura } from "../utils/formatters";

function getStatusColor(status) {
  switch (status) {
    case "Pago":
      return "success";
    case "Pendente":
      return "warning";
    case "Vencido":
      return "error";
    case "Crédito":
      return "secondary";
    default:
      return "default";
  }
}

export default function FaturasTable() {
  const [faturas, setFaturas] = useState([]);
  const [notasCredito, setNotasCredito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const itensPorPagina = 4;

  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  // Filtros Locais — useMemo evita recalcular em cada render
  const linhasFiltradas = useMemo(() => {
    const search = pesquisa.toLowerCase();
    const matchPesquisa = (doc) =>
      !search ||
      (doc.numero && doc.numero.toLowerCase().includes(search)) ||
      (doc.cliente && doc.cliente.toLowerCase().includes(search)) ||
      (doc.nif && doc.nif.toLowerCase().includes(search));

    // Notas de Crédito são documentos próprios (não faturas com prefixo NC)
    if (filtroTipo === "Notas de Crédito(NC)") {
      return notasCredito
        .map((nc) => ({
          id: `nc-${nc.id}`,
          numero: nc.numero,
          cliente: nc.clienteNome,
          nif: null,
          dataEmissao: nc.dataEmissao,
          dataVencimento: null,
          total: nc.valor,
          estado: "CREDITO",
          isNotaCredito: true,
          faturaNumero: nc.faturaNumero,
          motivo: nc.motivo,
        }))
        .sort((a, b) => (b.dataEmissao || "").localeCompare(a.dataEmissao || ""))
        .filter(matchPesquisa);
    }

    return faturas.filter((fatura) => {
      if (!matchPesquisa(fatura)) return false;
      if (filtroTipo === "Faturas(FT)") return fatura.numero?.startsWith("FT");
      if (filtroTipo === "Faturas-Recebido(FR)") return fatura.numero?.startsWith("FR");
      return true; // Todos
    });
  }, [faturas, notasCredito, pesquisa, filtroTipo]);

  const { startIndex, endIndex, linhasPaginadas, totalPaginas } = useMemo(() => {
    const totalPaginas = Math.ceil(linhasFiltradas.length / itensPorPagina);
    const paginaEfetiva = Math.min(paginaAtual, Math.max(0, totalPaginas - 1));
    const start = paginaEfetiva * itensPorPagina;
    const end = start + itensPorPagina;
    return {
      startIndex: start,
      endIndex: end,
      linhasPaginadas: linhasFiltradas.slice(start, end),
      totalPaginas,
    };
  }, [linhasFiltradas, paginaAtual]);

  const handleAnterior = () => {
    if (paginaAtual > 0) setPaginaAtual((p) => p - 1);
  };
  const handleProximo = () => {
    if (paginaAtual < totalPaginas - 1) setPaginaAtual((p) => p + 1);
  };


  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [ncData, setNcData] = useState({ motivo: "", valor: "" });
  const [ncLoading, setNcLoading] = useState(false);
  const [confirmarPagar, setConfirmarPagar] = useState(false);
  const [pagarLoading, setPagarLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const carregar = useCallback(() => {
    Promise.all([faturasApi.listar(), notasCreditoApi.listar()])
      .then(([dados, notas]) => {
        // Ordena da faturação mais recente para a mais antiga
        setFaturas(
          [...dados].sort(
            (a, b) =>
              (b.dataEmissao || '').localeCompare(a.dataEmissao || '') ||
              b.id - a.id
          )
        );
        setNotasCredito(notas || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleMenuClick = (event, fatura) => {
    setAnchorEl(event.currentTarget);
    setFaturaSelecionada(fatura);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNcData({ motivo: "", valor: faturaSelecionada?.total || "" });
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFaturaSelecionada(null);
  };

  const handleSubmitNc = () => {
    if (!ncData.motivo || !ncData.valor) return;
    setNcLoading(true);
    notasCreditoApi.criar({
      faturaId: faturaSelecionada.id,
      motivo: ncData.motivo,
      valor: parseFloat(ncData.valor)
    }).then(() => {
      showMessage("Nota de Crédito emitida com sucesso!", "success");
      handleCloseDialog();
      carregar();
    }).catch(err => {
      showMessage("Erro ao emitir: " + (err.response?.data?.message || err.response?.data || err.message), "error");
    }).finally(() => {
      setNcLoading(false);
    });
  };

  const handleMarcarPaga = () => {
    if (!faturaSelecionada) return;
    setPagarLoading(true);
    faturasApi
      .marcarComoPaga(faturaSelecionada.id)
      .then(() => {
        showMessage(`Fatura ${faturaSelecionada.numero} marcada como Paga!`, "success");
        setConfirmarPagar(false);
        setFaturaSelecionada(null);
        carregar();
      })
      .catch((err) => {
        showMessage(
          "Erro ao marcar como paga: " + (err.response?.data?.message || err.response?.data || err.message),
          "error"
        );
        setConfirmarPagar(false);
      })
      .finally(() => setPagarLoading(false));
  };

  return (
    <Paper sx={{ boxShadow: "none", background: "transparent", width: "100%", minWidth: 0 }}>
      
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        {/* Tabela */}
      <Box sx={{ marginTop: "2px" }}>
        <Card sx={{ maxWidth: 2000 }}>
          
        </Card>
        <Box sx={{ marginTop: "20px" }}>
        <Card sx={{ p: 1, width: "100%" }}>
          <CardContent
            sx={{
              display: "flex",
              gap: { xs: 1, sm: 5 },
              height: "50px",
              alignItems: "center",
              width:"40rem"
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
                placeholder="Pesquisar por Nº, Cliente, NIF..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </Paper>
          </CardContent>
          <Divider />
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
            {["Todos", "Faturas(FT)", "Faturas-Recebido(FR)", "Notas de Crédito(NC)"].map((tipo) => (
              <Button
                key={tipo}
                variant="text"
                onClick={() => setFiltroTipo(tipo)}
                sx={{
                  color: filtroTipo === tipo ? "#0B6E4F" : "black",
                  fontSize: "0.85rem",
                  fontWeight: filtroTipo === tipo ? "bold" : "500",
                  textTransform: "none",
                  minWidth: "auto",
                }}
              >
                {tipo}
              </Button>
            ))}
          </CardContent>
        </Card>
      </Box>
      </Box>
      <Table sx={{ minWidth: 750, bgcolor: 'white' }}>
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            {[
              "Estado",
              "Documentos",
              "Clientes",
              "Emissão",
              "Vencimento",
              "Total (Kz)",
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
          ) : linhasPaginadas.map((row) => {
              const estado = labelEstadoFatura(row.estado);
              return (
                <TableRow key={row.id} hover>
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

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {row.numero}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", fontWeight: "500" }}>
                    <Box>
                      <strong>{row.cliente}</strong>
                      <br />
                      {row.isNotaCredito ? (
                        <>Fatura: {row.faturaNumero}</>
                      ) : (
                        <>NIF: {row.nif}</>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {formatData(row.dataEmissao)}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {formatData(row.dataVencimento)}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {formatKzSemPrefixo(row.total)}
                  </TableCell>

                  <TableCell sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                    {!row.isNotaCredito && (
                      <>
                        <IconButton size="small">
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() =>
                            row.estado === "PAGO" &&
                            faturasApi.baixarPdf(row.id, row.numero)
                          }
                          disabled={row.estado !== "PAGO"}
                          title={
                            row.estado === "PAGO"
                              ? "Baixar PDF da Fatura"
                              : "Fatura deve estar PAGA para baixar PDF"
                          }
                        >
                          <DownloadIcon
                            sx={{
                              fontSize: 18,
                              color: row.estado === "PAGO" ? "#1976d2" : "#ccc",
                            }}
                          />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, row)}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </>
                    )}
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
              A mostrar {linhasFiltradas.length > 0 ? startIndex + 1 : 0} a{" "}
              {Math.min(endIndex, linhasFiltradas.length)} de{" "}
              {linhasFiltradas.length}{" "}
              {filtroTipo === "Notas de Crédito(NC)" ? "nota(s) de crédito" : "fatura(s)"}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {faturaSelecionada?.estado !== "PAGO" && (
          <MenuItem onClick={() => { handleMenuClose(); setConfirmarPagar(true); }}>
            Marcar como Paga
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDialog}>Emitir Nota de Crédito</MenuItem>
      </Menu>

      <Dialog open={confirmarPagar} onClose={() => setConfirmarPagar(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Marcar Fatura como Paga</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary">
            Confirma que deseja marcar a fatura{" "}
            <strong>{faturaSelecionada?.numero}</strong> como <strong>Paga</strong>
            (Total: {formatKzSemPrefixo(faturaSelecionada?.total || 0)} Kz)?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarPagar(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleMarcarPaga}
            variant="contained"
            sx={{ bgcolor: "#0B6E4F" }}
            disabled={pagarLoading}
          >
            {pagarLoading ? <CircularProgress size={24} /> : "Marcar como Paga"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Emitir Nota de Crédito</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Fatura: {faturaSelecionada?.numero} - Total:{" "}
            {formatKzSemPrefixo(faturaSelecionada?.total || 0)} Kz
          </Typography>
          <TextField
            label="Motivo (ex: Devolução, Desconto)"
            fullWidth
            margin="normal"
            value={ncData.motivo}
            onChange={(e) => setNcData({ ...ncData, motivo: e.target.value })}
            size="small"
          />
          <TextField
            label="Valor a Creditar (Kz)"
            fullWidth
            margin="normal"
            type="number"
            value={ncData.valor}
            onChange={(e) => setNcData({ ...ncData, valor: e.target.value })}
            size="small"
            inputProps={{ max: faturaSelecionada?.total || 0, min: 1 }}
            onKeyDown={(e) => {
              if (e.key === "-") e.preventDefault();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitNc}
            variant="contained"
            sx={{ bgcolor: "#0B6E4F" }}
            disabled={ncLoading}
          >
            {ncLoading ? <CircularProgress size={24} /> : "Emitir"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
    </Paper>
  );
}
