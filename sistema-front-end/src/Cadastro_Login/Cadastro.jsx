import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  IconButton,
  InputAdornment,
  Divider,
  FormControl,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { validarEmail } from '../utils/validators';

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    nif: '',
    telefoneEmpresa: '',
    endereco: '',
    sector: 'BEBIDAS',
    regimeIva: 'GERAL',
    nomeAdministrador: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nif' && value.length > 10) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!/^5\d{9}$/.test(formData.nif)) {
      setError("O NIF da Empresa deve conter 10 dígitos e começar por 5.");
      return;
    }
    if (!validarEmail(formData.email)) {
      setError("Insira um email válido");
      return;
    }
    if (formData.password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As palavras-passes não coincidem");
      return;
    }
    try {
      setError(null);
      await api.post('/api/auth/register', formData);
      setSuccessMsg("Empresa e Administrador criados com sucesso! Bem-vindo ao Kamba Gestão.");
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Erro ao registrar');
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#f4f6f9' }}>

      {/* COLUNA ESQUERDA: Painel Informativo */}
      <Grid
        item
        xs={12}
        md={6.5}
        sx={{
          p: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #E2E8F0'
        }}
      >
        <Box>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ bgcolor: '#083927', color: 'white', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
              <Security sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              Kamba Gestão
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" display="block" sx={{ mb: 4, color: '#64748B' }}>
            Configuração inicial da conta empresarial
          </Typography>

          {/* Título Principal */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              color: '#0F172A',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.75rem' },
              lineHeight: 1.2
            }}
          >
            Crie a empresa, defina o <br /> utilizador principal e comece a <br /> facturar com conformidade AGT.
          </Typography>

          <Typography variant="body1" sx={{ color: '#64748B', mb: 6, maxWidth: 540 }}>
            Este fluxo reúne os dados da organização e do administrador responsável para acelerar a ativação do sistema de inventário e facturação.
          </Typography>

          {/* Indicadores de Passos */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { num: 1, title: 'Dados da empresa', desc: 'Nome legal, NIF, setor, regime fiscal e contactos principais.', active: true },
              { num: 2, title: 'Administrador inicial', desc: 'Definição do utilizador responsável por facturação, inventário e permissões internas.' },
              { num: 3, title: 'Segurança e ativação', desc: 'Configuração de palavra-passe, preparação para emissão certificada.' }
            ].map((step) => (
              <Box key={step.num} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: step.active ? '#083927' : '#E2E8F0',
                  color: step.active ? 'white' : '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, flexShrink: 0
                }}>
                  {step.num}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* COLUNA DIREITA: Formulário */}
      <Grid
        item
        xs={12}
        md={5.5}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '54rem',
          ml:11,
          justifyContent: 'center',
          p: { xs: 4, md: 8 }
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 800, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {/* Cabeçalho */}
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Criar Conta
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Registre a empresa e o utilizador administrador no mesmo processo.
            </Typography>

            {/* Secção: Empresa */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#222', mb: 2 }}>
              Informações da Empresa
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                  Nome legal da empresa
                </Typography>
                <TextField
                  type="text"
                  name="nomeEmpresa"
                  value={formData.nomeEmpresa}
                  onChange={handleChange}
                  placeholder="TechDistribuição Angola, Lda"
                  size="small"
                  fullWidth
                />
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    NIF
                  </Typography>
                  <TextField
                    type="text"
                    name="nif"
                    value={formData.nif}
                    onChange={handleChange}
                    placeholder="5000123456"
                    size="small"
                    fullWidth
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Telefone
                  </Typography>
                  <TextField
                    type="number"
                    name="telefoneEmpresa"
                    value={formData.telefoneEmpresa}
                    onChange={handleChange}
                    placeholder="943093943"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                  />
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                  Endereço
                </Typography>
                <TextField
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Talatona, Luanda, Angola"
                  size="small"
                  fullWidth
                />
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Sector
                  </Typography>
                  <Select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="BEBIDAS">Bebidas</MenuItem>
                    <MenuItem value="ELECTRONICO">Electrónico</MenuItem>
                    <MenuItem value="COSMETICOS">Cosméticos</MenuItem>
                    <MenuItem value="PAPELARIA">Papelaria</MenuItem>
                    <MenuItem value="AUTOMOVEL">Automóvel</MenuItem>
                    <MenuItem value="AGRICULTURA">Agricultura</MenuItem>
                    <MenuItem value="VESTUARIO">Vestuário</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Regime de IVA
                  </Typography>
                  <Select
                    name="regimeIva"
                    value={formData.regimeIva}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="GERAL">Regime Geral (14%)</MenuItem>
                    <MenuItem value="SIMPLIFICADO">Regime Simplificado</MenuItem>
                    <MenuItem value="EXCLUSAO">Regime de Exclusão</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* Secção: Administrador */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#222', mb: 2 }}>
              Administrador
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Nome Completo
                  </Typography>
                  <TextField
                    type="text"
                    name="nomeAdministrador"
                    value={formData.nomeAdministrador}
                    onChange={handleChange}
                    placeholder="António Caponde"
                    size="small"
                    fullWidth
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Email
                  </Typography>
                  <TextField
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@empresa.com"
                    size="small"
                    fullWidth
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Palavra-passe
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', mb: 0.5, fontSize: '0.85rem' }}>
                    Confirmar Palavra-passe
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita a palavra-passe"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Mensagem de erro */}
            {error && (
              <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: 1.5, bgcolor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                {error}
              </Alert>
            )}

            {/* Botões */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                onClick={handleRegister}
                variant="contained"
                sx={{
                  bgcolor: '#083927',
                  '&:hover': { bgcolor: '#065F46' },
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.3,
                  px: 3,
                  borderRadius: 2,
                  flex: 1.5,
                  minWidth: 0,
                  fontSize: '0.9rem'
                }}
              >
                Criar empresa e utilizador
              </Button>

              <Button
                component={Link}
                to="/"
                variant="outlined"
                sx={{
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.3,
                  px: 3,
                  borderRadius: 2,
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.9rem',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC'
                  }
                }}
              >
                Voltar ao login
              </Button>
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* Snackbar de sucesso */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMsg(null)}
          severity="success"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
