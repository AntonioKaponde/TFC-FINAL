import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientesApi } from "../api";
import {
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Paper,
  Breadcrumbs,
  Container,
  Button,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavBar from "./NavBar";
import SideBar from "./SideBar";

const NovoCliente = () => {
  const navigate = useNavigate();
  const [tipoCliente, setTipoCliente] = useState("B2B");
  const [form, setForm] = useState({ nome: "", nif: "", email: "", telefone: "" });
  const [codigoGerado, setCodigoGerado] = useState("C-000001");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    clientesApi.listar().then((clientes) => {
      const total = clientes.length;
      setCodigoGerado(`C-${String(total + 1).padStart(6, "0")}`);
    }).catch(() => {});
  }, []);

  const handleSalvar = async () => {
    setErro("");

    if (!/^(5\d{9}|00\d{7}[A-Za-z]{2}\d{3})$/.test(form.nif)) {
      setErro("O NIF deve ser de uma Empresa (10 dígitos iniciados por 5) ou Particular (14 caracteres iniciados por 00 com 2 letras).");
      return;
    }

    if (!form.email.endsWith("@gmail.com")) {
      setErro("O email deve ser um endereço @gmail.com");
      return;
    }

    if (!/^9\d{8}$/.test(form.telefone)) {
      setErro("O telefone deve ter exatamente 9 dígitos e começar com 9.");
      return;
    }

    setSalvando(true);
    try {
      await clientesApi.criar({
        nome: form.nome,
        nif: form.nif,
        email: form.email,
        telefone: form.telefone,
        saldo: 0,
        empresa: tipoCliente === "B2B" ? "Empresa" : "Particular",
        ativo: true,
      });
      navigate("/clientes");
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || "Erro desconhecido ao salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  };

  const isB2B = tipoCliente === "B2B";

  return (
    <div>
      <NavBar />
      <Box sx={{ display: "flex" }}>
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 }, mt: "70px", width: "100%", boxSizing: "border-box" }}>
          <Container maxWidth="lg">
            {/* Breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 2, "& .MuiTypography-root": { fontSize: "0.85rem" } }}
            >
              <Link style={{ textDecoration: "none" }} to="/clientes">
                Clientes
              </Link>
              <Typography color="text.primary">Novo Cliente</Typography>
            </Breadcrumbs>

            {/* Título */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111" }}>
                Adicionar Novo Cliente
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ color: "#64748b", mt: 0.5 }}>
                Preencha os dados abaixo para registar um novo cliente no sistema.
              </Typography>
            </Box>

            {/* Formulário */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 3, border: "1px solid #e2e8f0" }}>

              {/* Tipo de Cliente */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                Tipo de Cliente <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <ToggleButtonGroup
                value={tipoCliente}
                exclusive
                onChange={(e, val) => {
                  if (val) {
                    setTipoCliente(val);
                    setForm({ ...form, nif: "" });
                  }
                }}
                sx={{
                  mb: 5,
                  gap: 2,
                  "& .MuiToggleButton-root": {
                    border: "1px solid #e2e8f0 !important",
                    borderRadius: "8px !important",
                    textTransform: "none",
                    px: 3,
                    "&.Mui-selected": {
                      bgcolor: "#eff6ff",
                      color: "#083927",
                      borderColor: "#083927 !important",
                    },
                  },
                }}
              >
                <ToggleButton value="B2B">
                  <BusinessIcon sx={{ mr: 1, fontSize: 20 }} /> Empresa (B2B)
                </ToggleButton>
                <ToggleButton value="B2C">
                  <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Particular (B2C)
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Seção: Informações Gerais */}
              <SectionHeader icon={<DescriptionIcon />} title="Informações Gerais" />
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                    Nome Completo *
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder={isB2B ? "Ex: Empresa XYZ Lda." : "Ex: João Manuel António"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                    NIF / N.º de Identificação *
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.nif}
                    onChange={(e) => {
                      const val = e.target.value;
                      const limite = isB2B ? 10 : 14;
                      if (val.length <= limite) setForm({ ...form, nif: val });
                    }}
                    placeholder={isB2B ? "Ex: 5000000000" : "Ex: 000000000LA000"}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                    Código de Cliente
                  </Typography>
                  <TextField
                    fullWidth
                    value={codigoGerado}
                    size="small"
                    disabled
                  />
                </Grid>
              </Grid>

              {/* Seção: Contactos — B2C só mostra email e telefone; B2B mostra tudo */}
              <SectionHeader
                icon={<LocationOnIcon />}
                title={isB2B ? "Contactos e Morada" : "Contactos"}
              />
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ex: contacto@gmail.com"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Label>Telefone / Telemóvel *</Label>
                  <TextField
                    fullWidth
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 9) setForm({ ...form, telefone: val });
                    }}
                    placeholder="900000000"
                    size="small"
                    inputProps={{ maxLength: 9 }}
                    error={form.telefone.length > 0 && !/^9\d{8}$/.test(form.telefone)}
                    helperText={form.telefone.length > 0 && !/^9\d{8}$/.test(form.telefone) ? "O telefone deve ter 9 dígitos e começar com 9" : ""}
                  />
                </Grid>

                {/* Campos de morada — apenas visíveis para Empresas (B2B) */}
                {isB2B && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                        Morada Completa
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Rua, Bairro, Edifício..."
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#0F172A", mb: 1, display: "block" }}>
                        Cidade / Província *
                      </Typography>
                      <TextField select fullWidth defaultValue="Luanda" size="small">
                        <MenuItem value="Luanda">Luanda</MenuItem>
                        <MenuItem value="cuanza norte">C.Norte</MenuItem>
                        <MenuItem value="bengo">Bengo</MenuItem>
                        <MenuItem value="moxico">Moxico</MenuItem>
                        <MenuItem value="cabinda">Cabinda</MenuItem>
                        <MenuItem value="cunene">Cunene</MenuItem>
                        <MenuItem value="huila">Huíla</MenuItem>
                        <MenuItem value="lunda sul">L.Sul</MenuItem>
                        <MenuItem value="lunda norte">L.Norte</MenuItem>
                        <MenuItem value="uige">Uíge</MenuItem>
                        <MenuItem value="namibe">Namibe</MenuItem>
                        <MenuItem value="cuando cubango">Cuando Cubango</MenuItem>
                        <MenuItem value="benguela">Benguela</MenuItem>
                      </TextField>
                    </Grid>
                  </>
                )}
              </Grid>

              {/* Mensagem de erro */}
              {erro && (
                <Typography color="error" sx={{ mt: 2, mb: 1 }}>
                  {erro}
                </Typography>
              )}

              {/* Botões */}
              <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  onClick={() => navigate("/clientes")}
                  sx={{ background: "#f1f5f9", color: "#334155", textTransform: "none", fontWeight: 600 }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={salvando}
                  sx={{ background: "#0B6E4F", color: "#fff", textTransform: "none", fontWeight: 600 }}
                >
                  {salvando ? "A guardar..." : "Guardar"}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </div>
  );
};

// Componentes auxiliares
const SectionHeader = ({ icon, title }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      {React.cloneElement(icon, { sx: { fontSize: 20, color: "#64748b", mr: 1 } })}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#334155" }}>
        {title}
      </Typography>
    </Box>
    <Divider />
  </Box>
);

const Label = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, color: "#334155" }}>
    {children}
  </Typography>
);

export default NovoCliente;
