import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Typography,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavBar from "./NavBar";
import SideBar from './SideBar';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Snackbar, Alert } from '@mui/material';
export default function CriarUsuarios() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    emailProfissional: '',
    password: '',
    roleId: '',
    enviarConvite: true,
  });
  
  const [roles, setRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await api.get('/api/roles');
        setRoles(data);
      } catch (error) {
        console.error('Erro ao carregar papéis:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailProfissional.endsWith('@gmail.com')) {
      showMessage('O email deve ser um endereço @gmail.com', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showMessage('A senha deve ter pelo menos 8 caracteres', 'error');
      return;
    }

    try {
      await api.post('/api/usuarios', {
        nome: formData.nomeCompleto,
        email: formData.emailProfissional,
        password: formData.password,
        roleId: formData.roleId
      });
      showMessage('Usuário criado com sucesso!');
      // Limpar formulário ou redirecionar
      setFormData({
        nomeCompleto: '',
        emailProfissional: '',
        password: '',
        roleId: '',
        enviarConvite: true,
      });
    } catch (error) {
      showMessage(error.response?.data?.message || error.response?.data || error.message || 'Erro ao criar usuário', 'error');
    }
  };

  return (
    <div>
      <NavBar />
      <Box display={"flex"}>
         <SideBar />
        <Container maxWidth="md" sx={{ flexGrow: 1, minWidth: 0, py: 4, px: { xs: 2, md: 3 }, mt: '70px', boxSizing: 'border-box' }}>
      {/* Botão Voltar */}
      <Button
        startIcon={<ArrowBackIcon />}
        sx={{
          textTransform: 'none',
          color: '#5c5c70',
          fontSize: '14px',
          mb: 2,
          '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
        }}
      >
        <Link style={{textDecoration:"none"}} to="/gestaoUsuarios">
            Voltar para Todos os Usuários
        </Link>
        
      </Button>

      {/* Título Principal */}
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
        Adicionar Novo Usuário
      </Typography>
      <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
        Preencha os detalhes abaixo para criar um novo acesso ao sistema.
      </Typography>

      {/* Card do Formulário */}
      <Card 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          borderRadius: '16px', 
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e5e7eb',
          overflow: 'visible'
        }}
      >
        {/* Seção: Informações Pessoais */}
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 3 }}>
            Informações Pessoais
          </Typography>

          <Grid container spacing={3}>
            {/* Nome Completo */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Nome Completo <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="nomeCompleto"
                placeholder="Ex: Maria Fernandes"
                value={formData.nomeCompleto}
                onChange={handleChange}
                variant="outlined"
                size="small"
                inputProps={{ style: { padding: '10px 14px' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>

            {/* Email Profissional */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Email Profissional <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="emailProfissional"
                placeholder="nome@angofatur.ao"
                value={formData.emailProfissional}
                onChange={handleChange}
                variant="outlined"
                size="small"
                inputProps={{ style: { padding: '10px 14px' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <TextField
                          fullWidth
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          type={showPassword ? 'text' : 'password'}
                          variant="outlined"
                          size="small"
                          sx={{ mb: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                            style: { borderRadius: 8,padding: '2px 14px' }
                          }}
                        />
            </Grid>

            {/* Nível de Acesso */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Nível de Acesso (Papel) <span style={{ color: '#ef4444' }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="roleId"
                  displayEmpty
                  value={formData.roleId}
                  onChange={handleChange}
                  sx={{ borderRadius: '8px' }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return <span style={{ color: '#9ca3af' }}>Selecione um papel...</span>;
                    }
                    const selectedRole = roles.find(r => r.id === selected);
                    return selectedRole ? selectedRole.nome : '';
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.nome}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ mx: 0, mt: 1, color: '#6b7280', fontSize: '13px' }}>
                  O papel define quais módulos o usuário poderá acessar.
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ borderColor: '#f3f4f6' }} />

         {/*{/* Seção: Segurança da Conta 
        <Box sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', mb: 2 }}>
            Segurança da Conta
          </Typography>

          Box do Checkbox (Estilo Alerta/Container) 
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              backgroundColor: '#f4f7fe',
              border: '1px solid #e0e7ff',
              borderRadius: '12px',
              p: 2,
            }}
          >
            <Checkbox
              name="enviarConvite"
              checked={formData.enviarConvite}
              onChange={handleChange}
              color="primary"
              sx={{ p: 0, mr: 2, mt: '2px' }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Enviar convite por email
              </Typography>
              <Typography variant="caption" sx={{ color: '#4b5563', display: 'block', mt: 0.5 }}>
                O usuário receberá um link para definir sua própria senha e acessar o sistema.
              </Typography>
            </Box>
          </Box>
        </Box>*/}

        {/* Rodapé com os Botões de Ação */}
        <Box 
          sx={{ 
            p: 3, 
            backgroundColor: '#fafafa', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2,
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px'
          }}
        >
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              borderColor: '#d1d5db',
              color: '#374151',
              px: 3,
              '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' }
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              backgroundColor: '#0561e2',
              px: 3,
              '&:hover': { backgroundColor: '#044eb5' }
            }}
          >
            Criar Usuário
          </Button>
        </Box>
      </Card>

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

    </Container>
      </Box> 
    </div>
  );
}