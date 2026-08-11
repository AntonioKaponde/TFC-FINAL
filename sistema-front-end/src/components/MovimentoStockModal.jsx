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
    fornecedorId: "",
    precoCustoUnitario: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(null);

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
        fornecedorId: "",
        precoCustoUnitario: ""
      });
    }
  }, [open, artigoIdProp]);

  const [formatKz] = useState(() => (valor) => {
    if (valor == null) return 'Kz 0,00';
    const num = typeof valor === 'number' ? valor : Number(valor);
    return `Kz ${num.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  });

  const handleSave = async () => {
    setErro("");
    setSucesso(null);
    setSalvando(true);
    try {
      const response = await movimentosEstoqueApi.criar({
        artigoId: form.artigoId,
        quantidade: Number(form.quantidade),
        tipoMovimento: form.tipoMovimento,
        observacao: form.observacao,
        fornecedorId: form.fornecedorId || null,
        precoCustoUnitario: form.precoCustoUnitario ? Number(form.precoCustoUnitario) : null
      });

      // Se a API retornou ivaCompra, mostrar feedback
      const ivaValor = response?.ivaCompra;
      if (ivaValor != null && Number(ivaValor) > 0) {
        setSucesso(`✓ IVA Dedutível calculado: ${formatKz(ivaValor)}`);
      } else if (form.tipoMovimento === "ENTRADA" && form.fornecedorId) {
        setSucesso(`✓ Movimento registado (sem IVA dedutível — informe o preço de custo para calcular)`);
      } else {
        setSucesso(`✓ Movimento registado com sucesso`);
      }

      // Aguardar 1.5s para mostrar o feedback antes de fechar
      setTimeout(() => {
        onSucesso();
        onClose();
        setSucesso(null);
      }, 1500);
    } catch (e) {
      setErro("Erro ao movimentar stock: " + (e.response?.data?.message || e.response?.data || e.message));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', pr: 6 }}>Movimentar Stock</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {erro && <Typography color="error" sx={{ mb: 2 }}>{erro}</Typography>}
        {sucesso && <Typography color="success.main" sx={{ mb: 2, fontWeight: 600, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px solid #bbf7d0' }}>{sucesso}</Typography>}
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
          <>
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
            {form.fornecedorId && (
              <TextField
                label="Preço de Custo Unitário (Kz)"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={form.precoCustoUnitario}
                onChange={(e) => setForm({ ...form, precoCustoUnitario: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Valor pago por unidade ao fornecedor (para cálculo do IVA Dedutível)"
              />
            )}
          </>
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
      <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={salvando} sx={{ bgcolor: "#0B6E4F", textTransform: 'none', fontWeight: 600 }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
