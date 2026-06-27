import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import SideBar from "./SideBar";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import TabelaVenda from "./TabelaVenda";
import CardVenda from "./CardVenda";
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { artigosApi, clientesApi, faturasApi } from "../api";
import {
  calcularTotaisLinhas,
  daquiDiasIso,
  formatData,
  hojeIso,
} from "../utils/formatters";

const linhaVazia = () => ({ artigoId: "", quantidade: 1 });

export default function Vendas() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [dataEmissao, setDataEmissao] = useState(hojeIso());
  const [dataVencimento, setDataVencimento] = useState(daquiDiasIso(30));
  const [linhas, setLinhas] = useState([linhaVazia()]);

  useEffect(() => {
    Promise.all([clientesApi.listar(), artigosApi.listar()])
      .then(([c, a]) => {
        setClientes(c);
        setArtigos(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const cliente = clientes.find((c) => c.id === Number(clienteId));
  const totais = useMemo(() => calcularTotaisLinhas(linhas, artigos), [linhas, artigos]);

  const emitirFatura = async () => {
    setErro("");
    if (!clienteId) {
      setErro("Selecione um cliente.");
      return;
    }

    const linhasValidas = linhas.filter((l) => l.artigoId && Number(l.quantidade) > 0);
    if (linhasValidas.length === 0) {
      setErro("Adicione pelo menos um artigo à fatura.");
      return;
    }

    setSalvando(true);
    try {
      await faturasApi.criar({
        clienteId: Number(clienteId),
        dataEmissao,
        dataVencimento,
        linhas: linhasValidas.map((l) => ({
          artigoId: Number(l.artigoId),
          quantidade: Number(l.quantidade),
        })),
      });
      navigate("/faturacao");
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || "Erro desconhecido ao emitir a fatura.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  return (
    <div>
      <NavBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box component={"main"} sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
          <Grid container spacing={2}>
            <Box sx={{ mb: 4, width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Adicionar Nova Fatura
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Preencha os dados abaixo para registar uma nova fatura no sistema.
              </Typography>
            </Box>
            <Card sx={{ width: "100%", p: "20px" }}>
              <Typography sx={{ fontWeight: "bold", ml: 4, textTransform: "none" }}>
                Dados do Cliente
              </Typography>
              <Grid container spacing={2} sx={{ ml: 3, mt: 1 }}>
                <Grid>
                  <Typography variant="caption" sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Cliente <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <FormControl size="small">
                    <Select
                      value={clienteId}
                      displayEmpty
                      onChange={(e) => setClienteId(e.target.value)}
                      sx={{ width: "18rem", height: "40px" }}
                    >
                      <MenuItem value="" disabled>Selecione o cliente</MenuItem>
                      {clientes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <Typography sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }} variant="caption">NIF</Typography>
                  <TextField size="small" value={cliente?.nif || ""} disabled sx={{ width: "18rem" }} />
                </Grid>
                <Grid>
                  <Typography sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }} variant="caption">Telefone</Typography>
                  <TextField size="small" value={cliente?.telefone || ""} disabled sx={{ width: "18rem" }} />
                </Grid>
                <Grid>
                  <Typography variant="caption" sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Email
                  </Typography>
                  <TextField size="small" value={cliente?.email || ""} disabled sx={{ width: "18rem" }} />
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Card sx={{ width: "100%", p: "20px" }}>
              <Typography variant="caption" sx={{ ml: 5, fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Detalhes do Documento
              </Typography>
              <Grid container spacing={2} ml={5} mt={1}>
                <Grid>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Tipo de Documento<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <FormControl size="small">
                    <Select defaultValue="Fatura" sx={{ width: "410px" }} disabled>
                      <MenuItem value="Fatura">Fatura</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Data de Emissão
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    sx={{ width: "410px" }}
                  />
                </Grid>
                <Grid>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Data de Vencimento
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    sx={{ width: "410px" }}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Card sx={{ width: "100%", p: "20px" }}>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Artigos/Equipamentos</Typography>
              <br />
              <TabelaVenda
                linhas={linhas}
                artigos={artigos}
                onChange={setLinhas}
                onAddLinha={() => setLinhas([...linhas, linhaVazia()])}
                onRemoveLinha={(index) => setLinhas(linhas.filter((_, i) => i !== index))}
              />
              <br />
              <CardVenda
                subtotal={totais.subtotal}
                totalIva={totais.totalIva}
                total={totais.total}
                dataEntrega={formatData(dataEmissao)}
              />
              {erro && <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>}
              <Stack direction={"row"} sx={{ display: "flex", gap: 2, justifyContent: "end", pt: 2 }}>
                <Button variant="outlined" color="black" onClick={() => navigate("/faturacao")}>Cancelar</Button>
                <Button
                  variant="outlined"
                  color="black"
                  disabled={salvando}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#0B6E4F' }}
                >
                  <SaveOutlinedIcon />Guardar Rascunho
                </Button>
                <Button
                  variant="outlined"
                  onClick={emitirFatura}
                  disabled={salvando}
                  sx={{ color: "#fff", bgcolor: "#0B6E4F", textTransform: 'none', fontWeight: 600 }}
                >
                  <CheckBoxOutlinedIcon />{salvando ? "A emitir..." : "Emitir Fatura"}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}
