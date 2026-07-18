import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { artigosApi, categoriasApi, fornecedoresApi } from "../api";
import { taxaIvaFromSelect } from "../utils/formatters";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SideBar from "./SideBar";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TextareaAutosize from "@mui/material/TextareaAutosize";

export default function NovoArtigo() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    sku: "",
    categoriaId: "",
    fornecedorId: "",
    preco: "",
    precoCusto: "",
    taxaIva: "IVA Normal(14%)",
    motivoIsencao: "Selecione um motivo (Apenas se isento)",
    unidadeMedida: "UN",
    stock: "",
    stockMinimo: "5",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    Promise.all([categoriasApi.listar(), fornecedoresApi.listar()])
      .then(([cats, forns]) => {
        setCategorias(cats);
        setFornecedores(forns);
      })
      .catch((e) => console.error("Erro ao carregar dados auxiliares", e));
  }, []);

  const handleSalvar = async () => {
    setErro("");
    
    if (!form.fornecedorId) {
      setErro("O artigo deve estar obrigatoriamente associado a um fornecedor.");
      return;
    }

    setSalvando(true);
    try {
      await artigosApi.criar({
        nome: form.nome,
        sku: form.sku,
        categoriaId: form.categoriaId,
        fornecedorId: form.fornecedorId,
        preco: Number(form.preco),
        precoCusto: form.precoCusto ? Number(form.precoCusto) : null,
        taxaIva: taxaIvaFromSelect(form.taxaIva),
        motivoIsencao: form.taxaIva === "isento(0%)" ? form.motivoIsencao : null,
        unidadeMedida: form.unidadeMedida,
        stock: Number(form.stock || 0),
        stockMinimo: Number(form.stockMinimo || 0),
      });
      navigate("/inventario");
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || "Ocorreu um erro ao salvar o artigo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <NavBar />
      <Box display={"flex"}>
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: '1120px' }}>
            <Box sx={{ mb: 4, width: '100%' }}>
                          <Typography
                           variant="h6" sx={{ fontWeight: 800, color: '#111' }}
                          >
                            Adicionar Novo Artigo
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Preencha os dados abaixo para registar um novo artigo no
                            sistema.
                          </Typography>
                        </Box>
            <Card sx={{ p: { xs: 2, md: 5 }, width: "100%" }}>
              <Grid>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                  Informações Gerais
                </Typography>
                <Typography sx={{ fontSize: ".6rem", color: "#64748b" }}>
                  Detalhes principais do produto para identificação no sistema e
                  SAFT-T
                </Typography>
              </Grid>
              <Grid sx={{ mt: 3, display: "flex", gap: 2 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Nome do Artigo <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex:Computador Portátil Pro X"
                    style={{
                      width: "500px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid #05040444",
                      margin: "2px 0",
                    }}
                    className="input"
                  />
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Código(SKU)<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Ex:LAP-PRO-X"
                    style={{
                      width: "500px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid #05040444",
                      margin: "2px 0",
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid sx={{ mt: 3, display: "flex", gap: 2 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Categoria</Typography>
                  <Select
                    value={form.categoriaId}
                    onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    sx={{ width: "500px", height: "2.1em", margin: "2px 0" }}
                  >
                    {categorias.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Fornecedor <span style={{ color: "red" }}>*</span></Typography>
                  <Select
                    value={form.fornecedorId}
                    onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
                    sx={{ width: "500px", height: "2.1em", margin: "2px 0" }}
                    displayEmpty
                  >
                    <MenuItem value=""><em>Selecione o Fornecedor</em></MenuItem>
                    {fornecedores.map(forn => (
                      <MenuItem key={forn.id} value={forn.id}>{forn.nome}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid sx={{ mt: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Descrição(Opcional)</Typography>
                <br />
                <TextareaAutosize
                  placeholder="Descrição detalhada do artigo"
                  style={{
                    width: "1018px",
                    height: "5em",
                    padding: 15,
                    borderRadius: 5,
                    border: ".1px solid #05040444",
                    margin: "2px 0",
                  }}
                ></TextareaAutosize>
              </Grid>
              <Divider sx={{ m: "20px 0" }} />
              <Grid>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                  Preços e Impostos
                </Typography>
                <Typography sx={{ fontSize: ".6rem", color: "#64748b" }}>
                  Configuração de preços e enquadramento fiscal (IVA).
                </Typography>
              </Grid>
              <Grid sx={{ mt: 3, display: "flex", gap: 3 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Preço de Venda (S/IVA)
                    <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <input
                    type="number"
                    min="0"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    placeholder="Ex: 10000"
                    style={{
                      width: "330px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid#05040444",
                      margin: "2px 0",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Preço de Custo (S/IVA)
                  </Typography>
                  <input
                    type="number"
                    min="0"
                    value={form.precoCusto}
                    onChange={(e) => setForm({ ...form, precoCusto: e.target.value })}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    placeholder="Ex: 8000"
                    style={{
                      width: "330px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid#05040444",
                      margin: "2px 0",
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Taxa de Imposto(IVA)<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Select
                    value={form.taxaIva}
                    onChange={(e) => setForm({ ...form, taxaIva: e.target.value })}
                    sx={{ width: "330px", height: "2.1em", margin: "2px 0" }}
                  >
                    <MenuItem value="IVA Normal(14%)">IVA Normal(14%)</MenuItem>
                    <MenuItem value="IVA Reduzida(7%)">
                      IVA Reduzida(7%)
                    </MenuItem>
                    <MenuItem value="IVA Reduzida(5%)">
                      IVA Reduzida(5%)
                    </MenuItem>
                    <MenuItem value="isento(0%)">Isento(0%)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid sx={{ mt: 3, display: "flex", gap: 3 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Motivo de Isenção
                    {form.taxaIva === "isento(0%)" && <span style={{ color: "red" }}>*</span>}
                  </Typography>
                  <Select
                    value={form.motivoIsencao}
                    onChange={(e) => setForm({ ...form, motivoIsencao: e.target.value })}
                    disabled={form.taxaIva !== "isento(0%)"}
                    sx={{ width: "1024px", height: "2.1em", margin: "2px 0", bgcolor: form.taxaIva !== "isento(0%)" ? "#f1f5f9" : "inherit" }}
                  >
                    <MenuItem value="Selecione um motivo (Apenas se isento)">
                      Selecione um motivo (Apenas se isento)
                    </MenuItem>
                    <MenuItem value="Artigo 9.º do CIVA">Artigo 9.º do CIVA</MenuItem>
                    <MenuItem value="Artigo 13.º do CIVA">Artigo 13.º do CIVA</MenuItem>
                    <MenuItem value="Artigo 14.º do CIVA">Artigo 14.º do CIVA</MenuItem>
                    <MenuItem value="Artigo 53.º do CIVA">Artigo 53.º do CIVA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Divider />
              <Grid>
                <Typography
                  sx={{ fontWeight: "bold", fontSize: "1.5rem", mt: "5px" }}
                >
                  Gestão de Stock
                </Typography>
              </Grid>

              {/**controlar stock 
              <Grid>
                <Card
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography>Controlar Stock</Typography>
                    <Typography sx={{ fontSize: ".6rem", color: "#64748b" }}>
                      Active para registar entradas e saídas e ser notificado
                      quando o stock estiver baixo
                    </Typography>
                  </Box>
                  <Box>
                    Loading
                  </Box>
                </Card>
              </Grid>*/}
              <br />
              <Grid sx={{ display: "flex", gap: 2 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Unidade de Medida<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <Select
                    value={form.unidadeMedida}
                    onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value })}
                    sx={{ width: "330px", height: "2.1em", margin: "2px 0" }}
                  >
                    <MenuItem value="UN">Unidade (UN)</MenuItem>
                    <MenuItem value="KG">Quilograma (KG)</MenuItem>
                    <MenuItem value="L">Litro (L)</MenuItem>
                    <MenuItem value="M">Metro (M)</MenuItem>
                    <MenuItem value="CX">Caixa (CX)</MenuItem>
                    <MenuItem value="SR">Serviço (SR)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Stock Inicial <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    style={{
                      width: "330px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid#05040444",
                      margin: "2px 0",
                    }}
                    placeholder="0"
                  />
                </FormControl>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Stock Minimo(Alerta)<span style={{ color: "red" }}>*</span>
                  </Typography>
                  <input
                    type="number"
                    min="0"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    style={{
                      width: "330px",
                      height: "2.5em",
                      padding: 10,
                      borderRadius: 5,
                      border: ".1px solid#05040444",
                      margin: "2px 0",
                    }}
                    placeholder="5"
                  />
                </FormControl>
              </Grid>
              {erro && (
                <Typography color="error" sx={{ mt: 2 }}>{erro}</Typography>
              )}
              <br />
              <Grid>
                <Stack
                  direction={"row"}
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "end",
                    pt: 2,
                    
                  }}
                >
                  <Button variant="outlined" color="black" onClick={() => navigate("/inventario")} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5}}>
                    Cancelar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSalvar}
                    disabled={salvando}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#0B6E4F",color:"#fff"}}
                  >
                    <SaveOutlinedIcon />
                    Guardar Arquivo
                  </Button>
                </Stack>
              </Grid>
            </Card>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
