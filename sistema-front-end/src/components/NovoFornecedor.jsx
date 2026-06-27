import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fornecedoresApi } from '../api';
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
  Button
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NavBar from './NavBar';
import SideBar from './SideBar';
import Clientes from '../pages/Clientes';

const NovoFornecedor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", nif: "", email: "", telefone: "", endereco: "" });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    setErro("");
    
    if (!/^(5\d{9}|00\d{7}[A-Za-z]{2}\d{3})$/.test(form.nif)) {
      setErro("O NIF deve ser de uma Empresa (10 dígitos iniciados por 5) ou Particular (14 caracteres iniciados por 00 com 2 letras).");
      return;
    }

    if (!form.email.endsWith('@gmail.com')) {
      setErro("O email deve ser um endereço @gmail.com");
      return;
    }

    setSalvando(true);
    try {
      await fornecedoresApi.criar({ ...form, ativo: true });
      navigate("/fornecedores");
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || "Erro desconhecido ao salvar o fornecedor.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <NavBar />
      <Box sx={{display:"flex"}}>
        <SideBar />
    <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
      <Container maxWidth="lg">
        
        {/* 1. Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2, '& .MuiTypography-root': { fontSize: '0.85rem' } }}
        >
          <Link style={{textDecoration:"none"}} to="/fornecedores">
            Fornecedores
          </Link>
          <Typography color="text.primary" variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Novo Fornecedor</Typography>
        </Breadcrumbs>

        {/* 2. Título e Subtítulo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
            Adicionar Fornecedor
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ color: '#64748b', mt: 0.5 }}>
            Preencha os dados do novo fornecedor para registro no sistema e SAF-T.
          </Typography>
        </Box>

        {/* 3. Card do Formulário */}
        <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          
          {/* Seção: Informações Gerais */}
          <SectionHeader icon={<DescriptionIcon />} title="Informações Gerais" />
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Nome do Fornecedor/Empresa<span style={{color:"red"}}>*</span></Typography>
              <TextField fullWidth value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: João Manuel António" size="small" sx={{width:"20rem"}}/>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>NIF<span style={{color:"red"}}>*</span></Typography>
              <TextField fullWidth value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} placeholder="Ex: 000000000LA000" size="small" sx={{width:"20rem"}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Código Interno</Typography>
              <TextField type='number' fullWidth placeholder="C-000257 (Gerado automaticamente)" size="small" disabled sx={{width:"20rem"}}/>
            </Grid>
          </Grid>

          {/* Seção: Contactos e Morada */}
          <SectionHeader icon={<LocationOnIcon />} title="Contactos e Morada" />
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Email<span style={{color:"red"}}>*</span></Typography>
              <TextField fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Ex: contacto@cliente.com" size="small" sx={{width:"14rem"}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Telefone / Telemóvel<span style={{color:"red"}}>*</span></Typography>
              <TextField fullWidth type="number" inputProps={{ min: 0 }} onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="900000000" size="small" sx={{width:"14rem"}} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Endereço Completa<span style={{color:"red"}}>*</span></Typography>
              <TextField fullWidth value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, Bairro, Edifício..." size="small" sx={{width:"14rem"}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Cidade / Província<span style={{color:"red"}}>*</span></Typography>
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
                <MenuItem value="cuando">Cuando</MenuItem>
                <MenuItem value="cubango">Cubango</MenuItem>
                <MenuItem value="benguela">Benguela</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>País<span style={{color:"red"}}>*</span></Typography>
              <TextField select fullWidth defaultValue="Angola" size="small" sx={{width:"7.5rem"}} >
                <MenuItem value="Angola">Angola</MenuItem>
                <MenuItem value="portugal">Portugal</MenuItem>
                <MenuItem value="africa do sul">A.Sul</MenuItem>
                <MenuItem value="moçambique">Moz</MenuItem>
                <MenuItem value="namibia">Namibia</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Seção: Informações Fiscais */}
          <SectionHeader icon={<AccountBalanceIcon />} title="Definições Financeiras e Outros" />
          <Grid container spacing={8} sx={{display:"flex",gap:2}}>
            <Grid item xs={12} md={6} sx={{width:"40%"}}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Condições de Pagamento Padrão</Typography>
              <TextField select fullWidth defaultValue="pronto" size="small" sx={{width:"30rem"}}>
                <MenuItem value="pronto">Pronto pagamento</MenuItem>
                <MenuItem value="prestacao">Prestações</MenuItem>
              </TextField>
            </Grid>
          
            <Grid item xs={12} sx={{width:"40%"}}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }} style={{marginLeft:"11rem"}}>Moeda Padrão</Typography>
              <TextField select fullWidth defaultValue="kwanza" size="small" displayEmpty sx={{width:"26rem",ml:23}}>
                <MenuItem value="kwanza" >AOA (Kwanza)</MenuItem>
                <MenuItem value="dolar" >USD (Dollar)</MenuItem>
                <MenuItem value="euro" >Eu (Euro)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{marginTop:"10px"}}>
            <Grid item xs={12} sx={{width:"60vw"}}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>Observações Internas</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Notas adicionais sobre o fornecedor..." />
            </Grid>
          </Grid>
         {erro && <Typography color="error" sx={{ mt: 2 }}>{erro}</Typography>}
         <Box sx={{marginTop:"20px",display:"flex",justifyContent:"flex-end", width: "100%"}}>
            <div style={{display:"flex",gap:10}}>
               <Button onClick={() => navigate("/fornecedores")} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#0B6E4F"}}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={salvando} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#0B6E4F"}}>{salvando ? "A guardar..." : "Guardar"}</Button>
            </div>
         </Box>
        </Paper>
      </Container>
    </Box>
      </Box>
    </div>
  );
};

// Componentes Auxiliares para manter o código limpo
const SectionHeader = ({ icon, title }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {React.cloneElement(icon, { sx: { fontSize: 20, color: '#64748b', mr: 1 } })}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
        {title}
      </Typography>
    </Box>
    <Divider />
  </Box>
);

const Label = ({ children }) => (
  <Typography variant="body2" sx={{ mb: 0.8, fontWeight: 500, color: '#334155' }}>
    {children}
  </Typography>
);

export default NovoFornecedor;