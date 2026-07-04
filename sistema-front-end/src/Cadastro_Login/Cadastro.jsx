
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import {
  CorporateFare,
  Visibility,
  VisibilityOff,
  Security,
  ArrowBack
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    nif: '',
    telefoneEmpresa: '',
    endereco: '',
    sector: 'FARMACIA',
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
    if (!formData.email.endsWith('@gmail.com')) {
      setError("O email deve ser um endereço @gmail.com");
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
        navigate('/'); // Redireciona para o login em caso de sucesso
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message || 'Erro ao registrar');
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#f4f6f9' }}>
      
      {/* COLUNA ESQUERDA: Painel Informativo e Passos */}
      <Grid 
        item 
        xs={12} 
        md={5} 
        sx={{ 
          p: { xs: 4, md: 8 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          bgcolor: '#ffffff',
          borderRight: '1px solid #e0e0e0'
        }}
      >
        <Box>
          {/* Logo e Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ bgcolor: '#083927', color: 'white', p: 0.8, borderRadius: 1.5, display: 'flex' }}>
             <Security sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Kamba Gestão
            </Typography>
          </Box>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 4 }}>
            Configuração inicial da conta empresarial
          </Typography>

          {/* Badge informativa 
          <Box sx={{ display: 'inline-block', bgcolor: '#e8eaf6', px: 2, py: 0.5, borderRadius: 2, mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
              ⚙️ Registo empresarial com utilizador administrador
            </Typography>
          </Box>*/}
          

          {/* Título Principal */}
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#111111', lineHeight: 1.2 }}>
            Crie a empresa, defina o <br /> utilizador  principal e  comece a <br /> faturar com conformidade AGT.
          </Typography>

          <Typography variant="body1" color="textSecondary" sx={{ mb: 5 }}>
            Este fluxo reúne os dados da organização e do administrador responsável para acelerar <br /> a ativação do sistema de inventário e faturação.
          </Typography>

          {/* Indicadores de Passos (Lista Visual) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              { num: 1, title: 'Dados da empresa', desc: 'Nome legal, NIF, setor, regime fiscal e contactos principais.', active: true },
              { num: 2, title: 'Administrador inicial', desc: 'Definição do utilizador responsável por faturação, inventário e permissões internas.' },
              { num: 3, title: 'Segurança e ativação', desc: 'Configuração de palavra-passe, segundo fator e preparação para emissão certificada.' }
            ].map((step) => (
              <Box key={step.num} sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  bgcolor: step.active ? '#083927' : '#e0e0e0', 
                  color: step.active ? 'white' : '#666',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: 14, flexShrink: 0
                }}>
                  {step.num}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Rodapé da esquerda
        <Box sx={{ mt: 4, bgcolor: '#e8eaf6', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
            Pronto para grossistas, distribuidores e retalho tecnológico
          </Typography>
        </Box> */}
        
      </Grid>


      {/* COLUNA DIREITA: Formulário */}
     <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p:2
        }}
      >
        <Card sx={{ width:"60rem"}}>
          <Box sx={{ p: 5 }}>
            <Grid>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Criar Conta</Typography>
              <Typography variant="body1" color="textSecondary">
                Registre a empresa e o utilizador administrador no mesmo
                processo.
              </Typography>
            </Grid>
              <Grid>
                <Typography variant="h6" sx={{ fontWeight: 'bold',mb:2 }}>Informações da Empresa</Typography>
              <form action="">
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>Nome legal da empresa </Typography>
                  <TextField
                    type="text"
                    name="nomeEmpresa"
                    value={formData.nomeEmpresa}
                    onChange={handleChange}
                    placeholder="TechDistribuição Angola,Lda"
                    sx={{ mb: 2 }}
                  />
                </FormControl>
                <FormControl
                  sx={{
                    width: "20rem",
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                  }}
                >
                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>NIF</Typography>
                    <TextField
                      type="text"
                      name="nif"
                      value={formData.nif}
                      onChange={handleChange}
                      placeholder="5000123456"
                      sx={{ width: "26rem" }}
                    />
                  </FormLabel>

                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>Telefone</Typography>
                    <TextField
                      type="number"
                      name="telefoneEmpresa"
                      value={formData.telefoneEmpresa}
                      onChange={handleChange}
                      placeholder="943093943"
                      inputProps={{ min: 0 }}
                      onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                      sx={{ width: "26.5rem" }}
                    />
                  </FormLabel>
                </FormControl>
                <FormControl sx={{ width: "20rem" }}></FormControl>
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>Endereço</Typography>
                  <TextField
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Talatona, Luanda, Angola"
                    sx={{ mb: 2 }}
                  />
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    mt: 1,
                    width: "20rem",
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                  }}
                >
                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222', }}>Sector</Typography>
                    <Select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      sx={{ width: "26rem", height: "55px" }}
                    >
                      <MenuItem value={"FARMACIA"}>Farmácia</MenuItem>
                      <MenuItem value={"CANTINA"}>Cantina</MenuItem>
                      <MenuItem value={"SUPERMERCADO"}>Supermercado</MenuItem>
                      <MenuItem value={"BARBEARIA"}>Barbearia</MenuItem>
                      <MenuItem value={"RESTAURANTE"}>Restaurante</MenuItem>
                      <MenuItem value={"TECNOLOGIA"}>Tecnologia</MenuItem>
                      <MenuItem value={"PAPELARIA"}>Papelaria</MenuItem>
                      <MenuItem value={"LIVRARIA"}>Livraria</MenuItem>
                    </Select>
                  </FormLabel>
                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>Regime de IVA</Typography>
                    <Select
                      name="regimeIva"
                      value={formData.regimeIva}
                      onChange={handleChange}
                      sx={{ width: "26.5rem", height: "55px",mb: 2,textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2  }}
                    >
                      <MenuItem value={"GERAL"}>Regime Geral (14%)</MenuItem>
                      <MenuItem value={"SIMPLIFICADO"}>Regime Simplificado</MenuItem>
                      <MenuItem value={"EXCLUSAO"}>Regime de Exclusão</MenuItem>
                    </Select>
                  </FormLabel>
                </FormControl>
              </form>
              </Grid>
              <Divider sx={{m:"2rem 0"}}/>
              <Grid>
                <Typography variant="h6" sx={{ fontWeight: 'bold' ,mb:2}}>Administrador</Typography>
              <form action="">
                <FormControl
                  sx={{
                    width: "20rem",
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    mb:2
                  }}
                >
                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222' }}>Nome Completo</Typography>
                    <TextField
                      type="text"
                      name="nomeAdministrador"
                      value={formData.nomeAdministrador}
                      onChange={handleChange}
                      placeholder="António Caponde"
                      sx={{width: "26rem",mb: 2,textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2  }}
                    />
                  </FormLabel>

                  <FormLabel>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#222' }}>Email</Typography>
                    <TextField
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@gmail.co.ao"
                      sx={{width: "26.5rem", mb: 2,textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2 , 
              fontWeight: 600
             }}
                    />
                  </FormLabel>
                </FormControl>
                 {/* Campo: Senha */}
                           <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                             Palavra-passe
                           </Typography>
                             <TextField
                               fullWidth
                               type={showPassword ? 'text' : 'password'}
                               name="password"
                               value={formData.password}
                               onChange={handleChange}
                               variant="outlined"
                               sx={{ mb: 2,textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2 }}
                             InputProps={{
                               endAdornment: (
                                 <InputAdornment position="end">
                                   <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                     {showPassword ? <VisibilityOff /> : <Visibility />}
                                   </IconButton>
                                 </InputAdornment>
                               ),
                               style: { borderRadius: 8 }
                             }}
                           />
                           {/* Campo: Senha */}
                                     <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                                       Confirmar Palavra-passe
                                     </Typography>
                                     <TextField
                                       fullWidth
                                       type={showPassword ? 'text' : 'password'}
                                       name="confirmPassword"
                                       value={formData.confirmPassword}
                                       onChange={handleChange}
                                       variant="outlined"
                                       sx={{ mb: 2 ,textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2,
              }}
                                       InputProps={{
                                         endAdornment: (
                                           <InputAdornment position="end">
                                             <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                               {showPassword ? <VisibilityOff /> : <Visibility />}
                                             </IconButton>
                                           </InputAdornment>
                                         ),
                                         style: { borderRadius: 8 }
                                       }}
                                     />
              </form>
              </Grid>
            {error && (
              <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            <Grid sx={{mt:5,display:"flex",gap:5,mb:5}}>
              <Button onClick={handleRegister} sx={{bgcolor:"#083927",color:"#fff",width:"26rem",height:"3rem",fontWeight:"bold",textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2,
              mb: 2,}} variant="outlined">Criar empresa e utilizador</Button>
              <Button sx={{bgcolor:"#f6fcfa",color:"#050505",height:"3rem",fontWeight:"bold",border:"1px solid #38323228"
                ,color: "inherit",
    "&.active": {
      bgcolor: "primary.main",
      color: "white",
    },
    "&:focus": {
      outline: "none",
    },
              }} variant="outlined" >
                 <Link style={{textDecoration:"none",color:"black",textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2,
              mb: 2,}} to="/">
                  Voltar ao login
            </Link>
              </Button>
            </Grid>
          </Box>
        </Card>
      </Grid>

          {/* Links do Rodapé 
           <Box sx={{ display: 'flex', justifyContent: 'between', mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="textSecondary">
              Já tem conta? <Box component="span" sx={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}>Iniciar sessão</Box>
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" sx={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}>
              Falar com suporte
            </Typography>
          </Box>*/}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMsg(null)}
          severity="success"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {successMsg}
        </Alert>
      </Snackbar>
    </Grid>

  );
}