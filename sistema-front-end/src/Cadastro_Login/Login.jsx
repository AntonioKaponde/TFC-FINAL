import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { guardarSessao } from '../utils/authStorage';
import { destinoPadrao } from '../utils/roles';
import { validarEmail } from '../utils/validators';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  Security,
  Description,
  BarChart,
  Business,
  MailOutline,
  Visibility,
  VisibilityOff,
  LockOutlined,
  CheckCircleOutline
} from '@mui/icons-material';import { Radio } from "@mui/material";
import { useNotificacoes } from "../context/NotificacoesContext";
export default function Login() {
  const { atualizar: atualizarNotificacoes } = useNotificacoes();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [currentTime] = useState(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return `Hoje, ${timeString}`;
  });
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!validarEmail(email)) {
      setError("Insira um email válido");
      return;
    }
    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres");
      return;
    }
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { email, password });
      if (response.accessToken) {
        // Sessão guardada por aba (sessionStorage) — nunca partilhada entre abas
        guardarSessao({
          token: response.accessToken,
          nome: response.nome,
          roles: response.roles,
          primeiroAcesso: response.primeiroAcesso,
        });
        // Utilizador criado pelo Admin ainda não trocou a palavra-passe → acesso condicionado
        if (response.primeiroAcesso) {
          navigate('/alterar-password');
          return;
        }
        // Atualiza as notificações de suporte assim que a sessão inicia
        if (response.roles && response.roles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN')) {
          atualizarNotificacoes();
        }
        // Cada papel entra diretamente na página inicial que lhe é permitida
        navigate(destinoPadrao(response.roles));
      }
    } catch (err) {
      // O erro tem a propriedade .status quando vem do nosso client.js
      // ou pode ser um TypeError de rede (fetch sem resposta)
      const status = err.status;
      if (status === 400) {
        setError('Dados inválidos. Verifique o email e a palavra-passe.');
      } else if (status === 401 || status === 403) {
        setError('Credenciais inválidas. O email ou a palavra-passe não estão corretos.');
      } else if (status === 404) {
        setError('Utilizador não encontrado. Verifique se introduziu o email correto.');
      } else if (status === 429) {
        setError('Muitas tentativas falhadas. Conta bloqueada temporariamente, tente novamente mais tarde.');
      } else if (status === 500) {
        setError('Erro interno do servidor. Por favor, tente novamente mais tarde.');
      } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Não foi possível conectar ao servidor. Verifique a sua ligação à internet ou tente novamente.');
      } else {
        setError('Não foi possível iniciar sessão. Verifique a sua ligação ou tente novamente.');
      }
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      
      {/* COLUNA ESQUERDA: Branding e Benefícios */}
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
        {/* Header / Logo */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ bgcolor: '#083927', p: 1, borderRadius: 1.5, display: 'flex' }}>
              <Security sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                Bem Vindo ao Kamba Gestão
              </Typography>
            </Box>
          </Box>


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
            Entre na sua operação fiscal <br /> com controlo, segurança e visibilidade total.
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#64748B', mb: 6, maxWidth: 540 }}>
            Acompanhe facturação eletrónica, inventário, SAF-T Angola e indicadores fiscais numa única plataforma preparada para equipas empresariais.
          </Typography>

          {/* Cards de Recursos */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 540 }}>
            {[
              {
                icon: <Description sx={{ color: '#083927' }} />,
                title: "Geração SAF-T Angola pronta para exportação",
                desc: "Estruture documentos, séries e dados fiscais com base nas exigências de comunicação."
              },
              {
                icon: <BarChart sx={{ color: "#083927" }} />,
                title: "Painel de IVA",
                desc: "Compare imposto a pagar, retenções e lucros retidos com leitura executiva."
              },
              {
                icon: <Business sx={{ color: '#083927' }} />,
                title: "Preparado para equipas e operações B2B",
                desc: "Ideal para distribuidores, grossistas e empresas com múltiplos utilizadores."
              }
            ].map((item, index) => (
              <Paper 
                key={index} 
                elevation={0} 
                sx={{ p: 2.5, borderRadius: 2, display: 'flex', gap: 2, border: '1px solid #F1F5F9' }}
              >
                <Box sx={{ bgcolor: '#F0F5FF', p: 1, borderRadius: 1.5, height: 'fit-content', display: 'flex' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Grid>

      {/* COLUNA DIREITA: Formulário de Autenticação */}
      <Grid 
        item 
        xs={12} 
        md={5.5} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          p: { xs: 4, md: 8 } 
        }}
      >
        <Box /> {/* Espaçador para empurrar o conteúdo para o centro */}

        {/* Card do Formulário */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 3, 
            border: '1px solid #E2E8F0', 
            maxWidth: 480, 
            width: '100%', 
            mx: 'auto' 
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
            Iniciar sessão
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 4 }}>
            Aceda com a conta da empresa e valide o segundo fator para entrar no sistema.
          </Typography>

          {/* Campo: Email */}
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
            Email empresarial
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@empresa.com"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MailOutline sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              style: { borderRadius: 8 }
            }}
          />

          {/* Campo: Senha */}
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
            Palavra-passe
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduza a sua palavra-passe"
            sx={{ mb: 2 }}
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

          {/* Nota sobre a sessão por aba */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              A sessão é válida apenas nesta aba. Ao abrir o sistema noutra aba, terá de iniciar sessão novamente.
            </Typography>
          </Box>

          {/* Seção 2FA */}
         
          

          {/* Alerta de Auditoria */}
          <Box sx={{ display: 'flex', gap: 1.5, bgcolor: '#EFF6FF', p: 2, borderRadius: 2, mb: 3, border: '1px solid #DBEAFE' }}>
            <LockOutlined sx={{ color: '#083927', fontSize: 20, mt: 0.2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#083927', lineHeight: 1.2 }}>
                Proteção de acesso e auditoria
              </Typography>
              <Typography variant="caption" sx={{ color: '#083927', display: 'block', mt: 0.5 }}>
                Último acesso registado: {currentTime} · IP empresarial validado · Sessão sujeita a trilha de auditoria.
              </Typography>
            </Box>
          </Box>

          {/* Botões de Ação */}
          <Button 
            fullWidth 
            variant="contained" 
            sx={{ 
              bgcolor: '#083927', 
              '&:hover': { bgcolor: '#083927' }, 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.5, 
              borderRadius: 2,
              mb: 2,
              color: "#fff",
    "&.active": {
      bgcolor: "primary.main",
      color: "white",
    },
    "&:focus": {
      outline: "none",
    },
            }}
            onClick={handleLogin}
          >
            Entrar no painel
          </Button>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 1, 
                mb: 2, 
                borderRadius: 2, 
                fontWeight: 500,
                bgcolor: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FCA5A5'
              }}
            >
              {error}
            </Alert>
          )}

          <Button 
            fullWidth 
            variant="text" 
            disabled={true}
            sx={{ 
              bgcolor: '#EFF6FF', 
              color: '#083927',
              '&:hover': { bgcolor: '#E0ECFF' }, 
              textTransform: 'none', 
              fontWeight: 600, 
              py: 1.2, 
              borderRadius: 2,    
            }}
          >
            Usar código de recuperação
          </Button>
        </Paper>

        {/* Rodapé Direito */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 480, mx: 'auto', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Não tem conta?          <Button variant="text" sx={{ p: 0, textTransform: 'none', fontWeight: 600, color: "#083927", minWidth: 'auto',
    "&.active": {
      bgcolor: "primary.main",
      color: "white",
    },
    "&:focus": {
      outline: "none",
    }, }}>
              <Link underline="none" color="inherit" to="/cadastro" style={{textDecoration:"none",color:"black"}}>
                  Criar registo
            </Link>
            </Button>
          </Typography>
          <Button disabled={true} variant="text" sx={{ p: 0, textTransform: 'none', fontWeight: 600, color: "#083927", minWidth: 'auto', fontSize: '0.875rem' }}>
            Precisa de apoio técnico?
          </Button>
        </Box>
      </Grid>

    </Grid>
  );
}