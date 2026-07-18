import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fornecedoresApi } from '../api';
import {
  Box,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Divider,
  Paper,
  Breadcrumbs,
  Container,
  Button,
  Alert,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import NavBar from './NavBar';
import SideBar from './SideBar';

const NovoFornecedor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    nif: '',
    email: '',
    telefone: '',
    endereco: '',
    produtosFornecidos: '',
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [telefoneErro, setTelefoneErro] = useState('');
  // Gerar código interno único (ex: C-123456)
  const [codigoInterno] = useState(`C-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleTelefone = (e) => {
    // Apenas dígitos, máximo 9 caracteres
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setForm({ ...form, telefone: val });
    if (val.length > 0 && (val.length !== 9 || !val.startsWith('9'))) {
      setTelefoneErro('O telemóvel deve ter exactamente 9 dígitos e começar com 9 (padrão angolano).');
    } else {
      setTelefoneErro('');
    }
  };

  const handleSalvar = async () => {
    setErro('');

    if (!/^5\d{9}$/.test(form.nif)) {
      setErro('O NIF do fornecedor deve possuir exactamente 10 caracteres numéricos e começar com o dígito 5.');
      return;
    }

    if (form.telefone && (form.telefone.length !== 9 || !form.telefone.startsWith('9'))) {
      setErro('O telemóvel deve ter exactamente 9 dígitos e começar com 9 (ex: 923456789).');
      return;
    }

    if (form.email && !form.email.endsWith('@gmail.com')) {
      setErro('O email deve ser um endereço @gmail.com');
      return;
    }

    setSalvando(true);
    try {
      await fornecedoresApi.criar({ ...form, ativo: true });
      navigate('/fornecedores');
    } catch (e) {
      setErro(e.response?.data?.message || e.response?.data || e.message || 'Erro desconhecido ao salvar o fornecedor.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div>
      <NavBar />
      <Box sx={{ display: 'flex' }}>
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: '70px', width: '100%', boxSizing: 'border-box' }}>
          <Container maxWidth="lg">

            {/* 1. Breadcrumbs */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 2, '& .MuiTypography-root': { fontSize: '0.85rem' } }}
            >
              <Link style={{ textDecoration: 'none' }} to="/fornecedores">
                Fornecedores
              </Link>
              <Typography color="text.primary" variant="h6" sx={{ fontWeight: 800, color: '#111' }}>Novo Fornecedor</Typography>
            </Breadcrumbs>

            {/* 2. Título */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Adicionar Fornecedor
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ color: '#64748b', mt: 0.5 }}>
                Preencha os dados do novo fornecedor para registo no sistema e SAF-T.
              </Typography>
            </Box>

            {/* 3. Formulário */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 5 }, borderRadius: 3, border: '1px solid #e2e8f0' }}>

              {/* Informações Gerais */}
              <SectionHeader icon={<DescriptionIcon />} title="Informações Gerais" />
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Nome do Fornecedor/Empresa<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: João Manuel António"
                    size="small"
                    sx={{ width: '20rem' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    NIF<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.nif}
                    onChange={(e) => setForm({ ...form, nif: e.target.value })}
                    placeholder="5007382748"
                    size="small"
                    type="number"
                    maxLength={10}
                    sx={{ width: '20rem' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Código Interno
                  </Typography>
                  <TextField
                    fullWidth
                    value={codigoInterno}
                    size="small"
                    disabled
                    sx={{ width: '20rem' }}
                  />
                </Grid>
              </Grid>

              {/* Produtos/Serviços Fornecidos */}
              <SectionHeader icon={<LocalShippingIcon />} title="Produtos / Serviços Fornecidos" />
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Descreva os produtos ou serviços que este fornecedor fornece
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                    Separe múltiplos produtos com vírgula. Ex: "Computadores, Impressoras, Material de escritório"
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={form.produtosFornecidos}
                    onChange={(e) => setForm({ ...form, produtosFornecidos: e.target.value })}
                    placeholder="Ex: Computadores, Impressoras, Monitores, Acessórios informáticos"
                    size="small"
                    sx={{ maxWidth: '44rem' }}
                  />
                </Grid>
              </Grid>

              {/* Contactos e Morada */}
              <SectionHeader icon={<LocationOnIcon />} title="Contactos e Morada" />
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Email<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ex: contacto@fornecedor.com"
                    size="small"
                    sx={{ width: '20rem' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Telemóvel<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    inputProps={{ maxLength: 9, inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={form.telefone}
                    onChange={handleTelefone}
                    placeholder="9XXXXXXXX (9 dígitos)"
                    size="small"
                    sx={{ width: '20rem' }}
                    error={!!telefoneErro}
                    helperText={telefoneErro || `${form.telefone.length}/9 dígitos`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Endereço Completo<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    placeholder="Rua, Bairro, Edifício..."
                    size="small"
                    sx={{ width: '20rem' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Cidade / Província<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField select fullWidth defaultValue="Luanda" size="small" sx={{ width: '14rem' }}>
                    <MenuItem value="Luanda">Luanda</MenuItem>
                    <MenuItem value="cuanza norte">C. Norte</MenuItem>
                    <MenuItem value="bengo">Bengo</MenuItem>
                    <MenuItem value="moxico">Moxico</MenuItem>
                    <MenuItem value="cabinda">Cabinda</MenuItem>
                    <MenuItem value="cunene">Cunene</MenuItem>
                    <MenuItem value="huila">Huíla</MenuItem>
                    <MenuItem value="lunda sul">L. Sul</MenuItem>
                    <MenuItem value="lunda norte">L. Norte</MenuItem>
                    <MenuItem value="uige">Uíge</MenuItem>
                    <MenuItem value="namibe">Namibe</MenuItem>
                    <MenuItem value="cuando">Cuando</MenuItem>
                    <MenuItem value="cubango">Cubango</MenuItem>
                    <MenuItem value="benguela">Benguela</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    País<span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField select fullWidth defaultValue="Angola" size="small" sx={{ width: '10rem' }}>
                    <MenuItem value="Angola">Angola</MenuItem>
                    <MenuItem value="portugal">Portugal</MenuItem>
                    <MenuItem value="africa do sul">África do Sul</MenuItem>
                    <MenuItem value="moçambique">Moçambique</MenuItem>
                    <MenuItem value="namibia">Namíbia</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {/* Definições Financeiras 
              <SectionHeader icon={<AccountBalanceIcon />} title="Definições Financeiras" />
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Condições de Pagamento Padrão
                  </Typography>
                  <TextField select fullWidth defaultValue="pronto" size="small" sx={{ width: '20rem' }}>
                    <MenuItem value="pronto">Pronto pagamento</MenuItem>
                    <MenuItem value="prestacao">Prestações</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Moeda Padrão
                  </Typography>
                  <TextField select fullWidth defaultValue="kwanza" size="small" sx={{ width: '20rem' }}>
                    <MenuItem value="kwanza">AOA (Kwanza)</MenuItem>
                    <MenuItem value="dolar">USD (Dólar)</MenuItem>
                    <MenuItem value="euro">EUR (Euro)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Observações Internas
                  </Typography>
                  <TextField fullWidth multiline rows={3} placeholder="Notas adicionais sobre o fornecedor..." />
                </Grid>
              </Grid>*/}

              {erro && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{erro}</Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button
                  onClick={() => navigate('/fornecedores')}
                  variant="outlined"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={salvando || !!telefoneErro}
                  variant="contained"
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none', bgcolor: '#0B6E4F', '&:hover': { bgcolor: '#094d38' } }}
                >
                  {salvando ? 'A guardar...' : 'Guardar Fornecedor'}
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>
    </div>
  );
};

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

export default NovoFornecedor;