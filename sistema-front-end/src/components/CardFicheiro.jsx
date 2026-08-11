import React, { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Select, MenuItem, FormControl, Button, Grid,
  Alert, List, ListItem, ListItemIcon, ListItemText, Stack, CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  DescriptionOutlined as FileIcon,
} from "@mui/icons-material";
import { faturasApi, saftApi } from "../api";
import { ANO_REFERENCIA, MESES_COMPLETOS, agruparFaturasPorMes, formatData } from "../utils/formatters";

const CardFicheiro = () => {
  const [ano, setAno] = useState(ANO_REFERENCIA);
  const [mes, setMes] = useState(MESES_COMPLETOS[new Date().getMonth()]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    faturasApi.listar().then((faturas) => {
      setGrupos(agruparFaturasPorMes(faturas));
    }).finally(() => setLoading(false));
  }, []);

  const ficheirosAno = grupos.filter((g) => g.chave.startsWith(String(ano)));
  const ultimoGrupo = grupos[0];

  const exportar = () => {
    const mesIndex = MESES_COMPLETOS.indexOf(mes) + 1;
    const chave = `${ano}-${String(mesIndex).padStart(2, '0')}`;
    const grupo = grupos.find((g) => g.chave === chave);
    
    if (grupo) {
      setExportLoading(true);
      saftApi.exportar(ano, mesIndex)
        .then(() => {
          showMessage(`SAF-T ${mes} ${ano} gerado com sucesso. Download iniciado.`, 'success');
        })
        .catch(() => {
          showMessage('Erro ao gerar ficheiro SAF-T. Tente novamente.', 'error');
        })
        .finally(() => setExportLoading(false));
    } else {
      showMessage(`Sem faturas registadas para ${mes} ${ano}.`, 'warning');
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa" }}>
      <Grid container spacing={3} sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, width: "100%" }}>
          <Grid item xs={12} lg={6} sx={{ flex: 1, minWidth: 0 }}>
            {/*Card responsável pela geração de  ficheiro saf-t */}
            <Card sx={{ p: { xs: 2.5, md: 5 }, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", width: "100%", borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FileIcon sx={{ color: "#083927", mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Gerar Ficheiro SAF-T</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Selecione o período para exportação do ficheiro XML formatado para a AGT.
              </Typography>

              <Grid container spacing={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Grid item xs={6}>
                  <Typography variant="caption" fontWeight="bold">Ano</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <Select value={ano} onChange={(e) => setAno(e.target.value)}>
                      {[2026, 2025, 2024, 2023].map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" fontWeight="bold">Mês</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <Select value={mes} onChange={(e) => setMes(e.target.value)}>
                      {MESES_COMPLETOS.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="caption" fontWeight="bold">Versão do Esquema XML</Typography>
                  <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                    <Select defaultValue="1.01" disabled sx={{ bgcolor: "#f0f2f5" }}>
                      <MenuItem value="1.01">1.01_01 (Última versão AGT)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                startIcon={exportLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                onClick={exportar}
                disabled={exportLoading}
                sx={{ mt: 2, py: 1.5, textTransform: "none", fontWeight: "bold", borderRadius: 2, background: exportLoading ? "#083927aa" : "#083927", width: "100%" }}
              >
                {exportLoading ? "A Exportar..." : "Exportar Ficheiro XML"}
              </Button>
            </Card>
          </Grid>
              {/*Cards para implmentação da quantidade de ficheiros gerados dia mes e ano, quantidade de documentos*/}
          <Grid item xs={12} lg={6} sx={{ flex: 1, minWidth: 0 }}>
            <Alert severity="warning" icon={<ErrorIcon sx={{ color: "#d32f2f" }} />} sx={{ bgcolor: "#ff9800", color: "#fff", mb: 3, borderRadius: 2, "& .MuiAlert-icon": { color: "#fff" } }}>
              <Typography variant="subtitle2" fontWeight="bold">Aviso de Submissão</Typography>
              O ficheiro SAF-T referente ao mês selecionado deve ser submetido no Portal do Contribuinte dentro do prazo legal.
            </Alert>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Grid item xs={12} sm={6} sx={{ flex: 1 }}>
                  <Card sx={{ p: "20px", borderRadius: 2, height: "100%" }}>
                    <Typography variant="caption" color="textSecondary">Ficheiros Gerados ({ano})</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      {loading ? '...' : ficheirosAno.length}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ flex: 1 }}>
                  <Card sx={{ p: "15px", borderRadius: 2, height: "100%" }}>
                    <Typography variant="caption" color="textSecondary">Última Emissão</Typography>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                      {ultimoGrupo ? formatData(ultimoGrupo.ultimaEmissao) : '-'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {ultimoGrupo ? `${ultimoGrupo.docs} documento(s)` : 'Sem registos'}
                    </Typography>
                  </Card>
                </Grid>
              </Stack>
            </Grid>

            <Card sx={{ borderRadius: 2, p: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, margin: "0 20px" }}>
                Checklist de Conformidade
              </Typography>
              <List dense sx={{ p: 0, textAlign: "center" }}>
                {[
                  "Assinatura digital de faturas ativa (RSA)",
                  "Série de documentos comunicada à AGT",
                  "Tipos de impostos parametrizados",
                ].map((text, index) => (
                  <ListItem key={index} sx={{ px: 0, margin: "0 20px" }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleIcon sx={{ color: "#083927", fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText primary={text} primaryTypographyProps={{ variant: "body2", color: "textSecondary" }} />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Box>
      </Grid>
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
};

export default CardFicheiro;
