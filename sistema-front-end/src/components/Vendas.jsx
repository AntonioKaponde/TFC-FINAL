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
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
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
import { obterRoles } from "../utils/authStorage";
import { ehGestorEstoque, destinoPadrao } from "../utils/roles";

const linhaVazia = () => ({ artigoId: "", quantidade: 1 });

export default function Vendas() {
  const navigate = useNavigate();

  const userRoles = obterRoles();
  const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');
  const semAcessoFaturacao = ehGestorEstoque(userRoles) || isContabilista;

  useEffect(() => {
    if (semAcessoFaturacao) {
      navigate(destinoPadrao(userRoles));
    }
  }, [semAcessoFaturacao, navigate]);
  const [clientes, setClientes] = useState([]);
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [dataEmissao, setDataEmissao] = useState(hojeIso());
  const [dataVencimento, setDataVencimento] = useState(daquiDiasIso(30));
  const [linhas, setLinhas] = useState([linhaVazia()]);
  const [pagoPronto, setPagoPronto] = useState(true);
  const [metodoPagamento, setMetodoPagamento] = useState('DINHEIRO');
  // Tipo de documento fiscal conforme Decreto n.º 34/09 Angola
  const [tipoDocumento, setTipoDocumento] = useState('FATURA_RECIBO');

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
        pagoPronto,
        tipoDocumento,
        metodoPagamento: pagoPronto ? metodoPagamento : null,
        linhas: linhasValidas.map((l) => ({
          artigoId: Number(l.artigoId),
          quantidade: Number(l.quantidade),
        })),
      });
      navigate('/faturacao');
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || 'Erro desconhecido ao emitir a fatura.');
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
        <Box component={"main"} sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
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
              <Typography sx={{ fontWeight: "bold", textTransform: "none" }}>
                Dados do Cliente
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Cliente <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={clienteId}
                      displayEmpty
                      onChange={(e) => setClienteId(e.target.value)}
                      sx={{ width: "100%", height: "40px" }}
                    >
                      <MenuItem value="" disabled>Selecione o cliente</MenuItem>
                      {clientes.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }} variant="caption">NIF</Typography>
                  <TextField size="small" value={cliente?.nif || ""} disabled sx={{ width: "100%" }} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }} variant="caption">Telefone</Typography>
                  <TextField size="small" value={cliente?.telefone || ""} disabled sx={{ width: "100%" }} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ margin: "0 10px", fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Email
                  </Typography>
                  <TextField size="small" value={cliente?.email || ""} disabled sx={{ width: "100%" }} />
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <br />
          <Grid container spacing={2}>
            <Card sx={{ width: "100%", p: "20px" }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Detalhes do Documento
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Tipo de Documento <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={tipoDocumento}
                      onChange={(e) => {
                        const tipo = e.target.value;
                        setTipoDocumento(tipo);
                        // Ajuste automático: Fatura implica pagamento diferido
                        if (tipo === 'FATURA') {
                          setPagoPronto(false);
                          setMetodoPagamento('');
                        } else if (tipo === 'FATURA_RECIBO' || tipo === 'FATURA_SIMPLIFICADA') {
                          setPagoPronto(true);
                          setMetodoPagamento('DINHEIRO');
                        }
                      }}
                      sx={{ width: '100%' }}
                    >
                      <MenuItem value="FATURA_RECIBO">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Fatura-Recibo</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Pagamento imediato — Art. 7.º Decreto 34/09</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="FATURA">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Fatura</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Pagamento diferido (a crédito) — Art. 5.º Decreto 34/09</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="FATURA_SIMPLIFICADA">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Fatura Simplificada</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>Pequeno valor / Consumidor final — Art. 8.º Decreto 34/09</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Data de Emissão
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={dataEmissao}
                    onChange={(e) => setDataEmissao(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Data de Vencimento
                  </Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Pagamento a Pronto
                  </Typography>
                  <FormControl component="fieldset" size="small">
                    <RadioGroup
                      row
                      value={pagoPronto ? 'sim' : 'nao'}
                      onChange={(e) => {
                        const isPronto = e.target.value === 'sim';
                        setPagoPronto(isPronto);
                        setMetodoPagamento(isPronto ? 'DINHEIRO' : '');
                        // Sincroniza tipo de documento
                        if (!isPronto && tipoDocumento !== 'FATURA') setTipoDocumento('FATURA');
                        if (isPronto && tipoDocumento === 'FATURA') setTipoDocumento('FATURA_RECIBO');
                      }}
                    >
                      <FormControlLabel value="sim" control={<Radio size="small" />} label="Sim" />
                      <FormControlLabel value="nao" control={<Radio size="small" />} label="Não" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                {pagoPronto && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Método de Pagamento
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value)}
                        sx={{ width: "100%" }}
                      >
                        <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                        <MenuItem value="TRANSFERENCIA">Transferência</MenuItem>
                        <MenuItem value="TPA">TPA</MenuItem>
                        <MenuItem value="MULTICAIXA">Multicaixa</MenuItem>
                        <MenuItem value="CHEQUE">Cheque</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
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
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ display: "flex", gap: 2, justifyContent: "end", pt: 2 }}>
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
