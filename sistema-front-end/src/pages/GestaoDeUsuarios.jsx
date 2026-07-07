import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ShieldOutlined as PermissionIcon,
  LockReset as ResetIcon,
  EditOutlined as EditIcon,
  VpnKeyOutlined as KeyIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';

export default function GestaoDeUsuarios() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', password: '', roleId: '' });
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        api.get('/api/usuarios'),
        api.get('/api/roles')
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      showNotification('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rolesString = localStorage.getItem('userRoles');
  const userRoles = rolesString ? JSON.parse(rolesString) : [];
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');

  const handleCreateUser = async () => {
    if (!newUser.nome || !newUser.email || !newUser.password || !newUser.roleId) {
      showNotification('Preencha todos os campos', 'warning');
      return;
    }

    if (!newUser.email.endsWith('@gmail.com')) {
      showNotification('O email deve ser um endereço @gmail.com', 'warning');
      return;
    }

    if (newUser.password.length < 8) {
      showNotification('A palavra-passe deve ter pelo menos 8 caracteres', 'warning');
      return;
    }
    
    try {
      await api.post('/api/usuarios', newUser);
      setOpenModal(false);
      setNewUser({ nome: '', email: '', password: '', roleId: '' });
      showNotification('Usuário criado com sucesso!', 'success');
      fetchData();
    } catch (error) {
      showNotification(error.message || 'Erro ao criar usuário', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleRemoveUserClick = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await api.delete(`/api/usuarios/${itemToDelete}`);
        showNotification('Usuário removido com sucesso!', 'success');
        fetchData();
      } catch (error) {
        showNotification(error.response?.data || error.message || 'Erro ao remover usuário', 'error');
      } finally {
        setOpenDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  return (
    <div>
      <NavBar />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f9' }}>
        <SideBar />
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 ,mt:10}}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111' }}>
                Todos os Usuários
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Gerencie os acessos e permissões da sua equipe.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={() => setOpenModal(true)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: "#083927" ,mr:19}}
              startIcon={<AddIcon />} 
            >
              Adicionar Usuário
            </Button>
          </Box>

          <Grid container spacing={3}>
            {loading ? <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} /> : users.map((user) => {
              const isActive = user.status === "Ativo";
              return (
                <Grid item xs={12} sm={6} lg={4} key={user.id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 2.5, position: 'relative', bgcolor: '#ffffff' }}>
                    <IconButton size="small" sx={{ position: 'absolute', top: 12, right: 12, color: '#888' }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                      <Avatar sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: '#083927' }} variant="rounded">
                        {user.nome.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', lineHeight: 1.2 }}>
                          {user.nome}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                          {user.email}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={user.role} 
                            size="small" 
                            sx={{ bgcolor: '#e3f2fd', color: '#0B6E4F', fontWeight: 600, borderRadius: '6px', fontSize: 11, height: 22 }} 
                          />
                          <Chip 
                            label={user.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: isActive ? '#e8f5e9' : '#ffebee', 
                              color: isActive ? '#2e7d32' : '#c62828', 
                              fontWeight: 600, 
                              borderRadius: '6px', fontSize: 11, height: 22
                            }} 
                          />
                        </Stack>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: '#f0f0f0' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                      <Button 
                        startIcon={<EditIcon sx={{ width: 16, height: 16 }} />} 
                        size="small" 
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#0B6E4F', fontSize: 12 }}
                      >
                        Editar Permissões
                      </Button>
                      <Button 
                        startIcon={<KeyIcon sx={{ width: 16, height: 16 }} />} 
                        size="small" 
                        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: 12 }}
                      >
                        Reset Password
                      </Button>
                      {isAdmin && (
                        <IconButton size="small" onClick={() => handleRemoveUserClick(user.id)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>

      {/* Modal Criar Usuário */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Adicionar Novo Usuário</DialogTitle>
        <DialogContent>
            <TextField
                margin="dense"
                label="Nome Completo"
                fullWidth
                variant="outlined"
                value={newUser.nome}
                onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                sx={{ mt: 2, mb: 2 }}
            />
            <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                sx={{ mb: 2 }}
            />
            <TextField
                margin="dense"
                label="Palavra-passe Inicial"
                type="password"
                fullWidth
                variant="outlined"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel id="role-select-label">Papel / Função</InputLabel>
              <Select
                labelId="role-select-label"
                value={newUser.roleId}
                label="Papel / Função"
                onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
              >
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>{role.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button onClick={handleCreateUser} variant="contained" sx={{ bgcolor: "#083927", '&:hover': {bgcolor: '#06291c'} }}>Salvar Usuário</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja eliminar este usuário? Esta acção não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
      </Snackbar>
    </div>
  );
}