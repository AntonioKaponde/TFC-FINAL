import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { categoriasApi } from "../api";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const carregarCategorias = async () => {
    try {
      const res = await categoriasApi.listar();
      setCategorias(res);
    } catch (e) {
      console.error("Erro ao carregar categorias", e);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setForm({ nome: "", descricao: "" });
    setOpen(true);
  };

  const handleEdit = (cat) => {
    setEditMode(true);
    setCurrentId(cat.id);
    setForm({ nome: cat.nome, descricao: cat.descricao || "" });
    setOpen(true);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await categoriasApi.remover(itemToDelete);
        showMessage("Categoria removida com sucesso!");
        carregarCategorias();
      } catch (e) {
        showMessage("Erro ao remover categoria: " + (e.response?.data?.message || e.response?.data || e.message), "error");
      } finally {
        setOpenDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await categoriasApi.atualizar(currentId, form);
        showMessage("Categoria atualizada com sucesso!");
      } else {
        await categoriasApi.criar(form);
        showMessage("Categoria criada com sucesso!");
      }
      setOpen(false);
      carregarCategorias();
    } catch (e) {
      showMessage("Erro ao salvar: " + (e.response?.data?.message || e.response?.data || e.message), "error");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh",display: "flex"}}>
      <NavBar />
      <SideBar />
      <Box component="main" sx={{ flexGrow: 10, p: 3, mt: 10,mr:10 }}>
        <Card sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Gestão de Categorias
            </Typography>
            <Button variant="contained" sx={{ bgcolor: "#083927" }} onClick={handleOpen}>
              Nova Categoria
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categorias.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.id}</TableCell>
                    <TableCell>{cat.nome}</TableCell>
                    <TableCell>{cat.descricao}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(cat)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(cat.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {categorias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Nenhuma categoria encontrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Categoria"
            fullWidth
            variant="outlined"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Descrição (Opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#0B6E4F" }}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja remover esta categoria? Esta acção não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
