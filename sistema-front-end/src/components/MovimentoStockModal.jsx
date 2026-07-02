import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Typography
} from "@mui/material";
import { movimentosEstoqueApi, artigosApi, fornecedoresApi } from "../api";

export default function MovimentoStockModal({ open, onClose, onSucesso, artigoId: artigoIdProp }) {
  const [artigos, setArtigos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState({
    artigoId: "",
    quantidade: "",
    tipoMovimento: "ENTRADA",
    observacao: "",
    fornecedorId: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (open) {
      Promise.all([artigosApi.listar(), fornecedoresApi.listar()])
        .then(([arts, forns]) => {
          setArtigos(arts);
          setFornecedores(forns);
          // Se um artigoId foi passado, pré-selecionar
          if (artigoIdProp && arts.some(a => a.id === Number(artigoIdProp))) {
            setForm(prev => ({ ...prev, artigoId: String(artigoIdProp) }));
          }
        })
        .catch(e => console.error(e));
      setForm({
        artigoId: artigoIdProp ? String(artigoIdProp) : "",
        quantidade: "",
        tipoMovimento: "ENTRADA",
        observacao: "",
        fornecedorId: ""
      });
    }
  }, [open, artigoIdProp]);

  const handleSave = async () => {
    setErro("");
    setSalvando(true);
    try {
      await movimentosEstoqueApi.criar({
        artigoId: form.artigoId,
        quantidade: Number(form.quantidade),
        tipoMovimento: form.tipoMovimento,
        observacao: form.observacao,
        fornecedorId: form.fornecedorId || null
      });
      onSucesso();
      onClose();
    } catch (e) {
      setErro("Erro ao movimentar stock: " + (e.response?.data?.message || e.response?.data || e.message));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Movimentar Stock</DialogTitle>
      <DialogContent>
        {erro && <Typography color="error" sx={{ mb: 2 }}>{erro}</Typography>}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight="bold">Artigo</Typography>
          <Select
            value={form.artigoId}
            onChange={(e) => setForm({ ...form, artigoId: e.target.value })}
            displayEmpty
          >
            <MenuItem value="" disabled>Selecione um artigo</MenuItem>
            {artigos.map(a => <MenuItem key={a.id} value={a.id}>{a.nome} (Stock: {a.stock})</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight="bold">Tipo de Movimento</Typography>
          <Select
            value={form.tipoMovimento}
            onChange={(e) => setForm({ ...form, tipoMovimento: e.target.value })}
          >
            <MenuItem value="ENTRADA">Entrada (+)</MenuItem>
            <MenuItem value="SAIDA">Saída (-)</MenuItem>
            <MenuItem value="AJUSTE">Ajuste (-)</MenuItem>
            <MenuItem value="DEVOLUCAO">Devolução (+)</MenuItem>
          </Select>
        </FormControl>

        {form.tipoMovimento === "ENTRADA" && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Typography variant="caption" fontWeight="bold">Fornecedor (Opcional)</Typography>
            <Select
              value={form.fornecedorId}
              onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
              displayEmpty
            >
              <MenuItem value="">Nenhum</MenuItem>
              {fornecedores.map(f => <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>)}
            </Select>
          </FormControl>
        )}

        <TextField
          label="Quantidade"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={form.quantidade}
          onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
          inputProps={{ min: 0 }}
          onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
        />

        <TextField
          label="Observação"
          fullWidth
          multiline
          rows={2}
          sx={{ mt: 2 }}
          value={form.observacao}
          onChange={(e) => setForm({ ...form, observacao: e.target.value })}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={salvando} sx={{ bgcolor: "#0B6E4F", textTransform: 'none', fontWeight: 600 }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
