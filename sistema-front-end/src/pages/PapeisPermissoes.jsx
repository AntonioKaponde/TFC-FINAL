import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Divider,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { api } from '../api/client';

const initialModulesTemplate = [
  { id: 'USUARIO', name: 'Usuário', view: false, edit: false, delete: false },
  { id: 'FORNECEDOR', name: 'Fornecedor', view: false, edit: false, delete: false },
  { id: 'DASHBOARD', name: 'Dashboard Fiscal', view: false, edit: false, delete: false },
  { id: 'FATURAMENTO', name: 'Faturação', view: false, edit: false, delete: false },
  { id: 'INVENTARIO', name: 'Inventário', view: false, edit: false, delete: false },
  { id: 'CLIENTES', name: 'Clientes', view: false, edit: false, delete: false },
  { id: 'SAFT', name: 'Ficheiro SAF-T', view: false, edit: false, delete: false },
  { id: 'CONFIG', name: 'Configurações', view: false, edit: false, delete: false },
  { id: 'AUDITORIA', name: 'Histórico de Auditoria', view: false, edit: false, delete: false },
];

export default function PapeisPermissoes() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [modules, setModules] = useState([...initialModulesTemplate]);
  
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Menu de contexto
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRole, setMenuRole] = useState(null);
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const MAX_ROLES = 10;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/roles');
      setRoles(data || []);
      if (data && data.length > 0 && !selectedRole) {
        handleSelectRole(data[0]);
      } else if (selectedRole && data) {
        const updatedSelected = data.find(r => r.id === selectedRole.id);
        if (updatedSelected) {
          handleSelectRole(updatedSelected);
        } else if (data.length > 0) {
          handleSelectRole(data[0]);
        } else {
          setSelectedRole(null);
          setModules([...initialModulesTemplate]);
        }
      }
    } catch (error) {
      const msg = error.message || 'Erro ao carregar papéis';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    if (!role) return;
    setSelectedRole(role);
    
    const perms = role.permissoes || [];
    const updatedModules = initialModulesTemplate.map(mod => ({
      ...mod,
      view: perms.includes(`${mod.id}_VIEW`),
      edit: perms.includes(`${mod.id}_EDIT`),
      delete: perms.includes(`${mod.id}_DELETE`),
    }));
    setModules(updatedModules);
  };

  const handlePermissionChange = (moduleId, field) => {
    setModules(prevModules =>
      prevModules.map(mod =>
        mod.id === moduleId ? { ...mod, [field]: !mod[field] } : mod
      )
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaveLoading(true);
    
    const permissoes = [];
    modules.forEach(mod => {
      if (mod.view) permissoes.push(`${mod.id}_VIEW`);
      if (mod.edit) permissoes.push(`${mod.id}_EDIT`);
      if (mod.delete) permissoes.push(`${mod.id}_DELETE`);
    });

    try {
      await api.put(`/api/roles/${selectedRole.id}`, {
        nome: selectedRole.nome,
        permissoes
      });
      showNotification('Permissões salvas com sucesso!', 'success');
      fetchRoles();
    } catch (error) {
      const msg = error.message || 'Erro ao salvar permissões';
      showNotification(msg, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      showNotification('O nome do papel é obrigatório', 'warning');
      return;
    }
    
    try {
      await api.post('/api/roles', {
        nome: newRoleName.trim(),
        permissoes: []
      });
      setOpenModal(false);
      setNewRoleName('');
      showNotification('Papel criado com sucesso!', 'success');
      fetchRoles();
    } catch (error) {
      const msg = error.message || 'Erro ao criar papel';
      showNotification(msg, 'error');
    }
  };

  const handleDeleteRole = async () => {
    if (!menuRole) return;
    setConfirmDeleteOpen(false);
    
    try {
      await api.delete(`/api/roles/${menuRole.id}`);
      showNotification(`Papel "${menuRole.nome}" removido com sucesso!`, 'success');
      if (selectedRole?.id === menuRole.id) {
        setSelectedRole(null);
        setModules([...initialModulesTemplate]);
      }
      setMenuRole(null);
      fetchRoles();
    } catch (error) {
      const msg = error.message || 'Erro ao remover papel';
      showNotification(msg, 'error');
    }
  };

  // Menu handlers
  const handleMenuOpen = (event, role) => {
    setAnchorEl(event.currentTarget);
    setMenuRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRole(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const canCreateMore = roles.length < MAX_ROLES;

  return (
   <div>
    <NavBar />
    <Box sx={{display:"flex"}}>
      <SideBar />
       <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, mt: 10, ml: 25 }}>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
           <Box>
             <Typography variant="h6" sx={{ fontWeight: 800, color: "#111" }}>
               Papéis e Permissões
             </Typography>
             <Typography variant="caption" color="textSecondary">
               Visualize o nível de acesso para cada função padrão do sistema. O sistema suporta apenas 4 papéis: Admin, Gerente de estoque, Contabilista e Operador.
             </Typography>
           </Box>
         </Box>

         {loading && roles.length === 0 ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
             <CircularProgress />
           </Box>
         ) : (
         <Grid container spacing={3}>
           {/* Left: Role List */}
           <Grid item xs={12} md={4}>
             <Stack spacing={2}>
               {roles.length === 0 ? (
                 <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                   <ShieldIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                   <Typography variant="body2" color="textSecondary">
                     Nenhum papel encontrado.
                   </Typography>
                 </Paper>
               ) : (
                 roles.map((role) => {
                   const isSelected = selectedRole?.id === role.id;
                   return (
                     <Card
                       key={role.id}
                       variant="outlined"
                       sx={{
                         borderRadius: 3,
                         border: isSelected ? "2px solid #083927" : "1px solid #e0e0e0",
                         boxShadow: isSelected ? "0px 4px 12px rgba(8, 57, 39, 0.08)" : "none",
                         cursor: "pointer",
                         transition: "all 0.2s ease",
                         '&:hover': {
                           borderColor: isSelected ? '#083927' : '#bbb',
                           boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
                         },
                       }}
                       onClick={() => handleSelectRole(role)}
                     >
                       <Box sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <Box>
                           <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#222" }}>
                             {role.nome}
                           </Typography>
                           <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                             <Chip
                               label={`${role.usersCount || 0} ${(role.usersCount || 0) === 1 ? "Usuário" : "Usuários"}`}
                               size="small"
                               sx={{
                                 bgcolor: isSelected ? "#e3f2fd" : "#f5f5f5",
                                 color: isSelected ? "#083927" : "#666",
                                 fontSize: 11, fontWeight: 700, borderRadius: "6px", height: 22,
                               }}
                             />
                             {isSelected && (
                               <Typography variant="caption" sx={{ color: "#083927", fontWeight: 700, fontSize: 11 }}>
                                 Editando
                               </Typography>
                             )}
                           </Stack>
                         </Box>
                         </Box>
                       </Card>
                   );
                 })
               )}
             </Stack>
           </Grid>

           {/* Right: Permission Matrix */}
           <Grid item xs={12} md={8}>
             <Paper variant="outlined" sx={{ borderRadius: 3, bgcolor: "#ffffff", display: "flex", flexDirection: "column", height: "100%",width:"200%" }}>
               <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <Box>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "inline", color: "#222" }}>
                     Permissões:{' '}
                   </Typography>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#083927", display: "inline" }}>
                     {selectedRole ? selectedRole.nome : 'Selecione um papel'}
                   </Typography>
                   <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                     Selecione quais módulos este papel pode visualizar ou modificar.
                   </Typography>
                 </Box>
               </Box>

               {!selectedRole ? (
                 <Box sx={{ p: 6, textAlign: 'center' }}>
                   <ShieldIcon sx={{ fontSize: 56, color: '#e0e0e0', mb: 2 }} />
                   <Typography variant="body1" color="textSecondary">
                     Selecione um papel à esquerda para editar suas permissões.
                   </Typography>
                 </Box>
               ) : (
               <>
               <TableContainer>
                 <Table size="small">
                   <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                     <TableRow>
                       <TableCell sx={{ fontWeight: 600, color: "#666", py: 1.5, pl: 3, borderBottom: "1px solid #eaeaea" }}>Módulo</TableCell>
                       <TableCell align="center" sx={{ fontWeight: 600, color: "#666", borderBottom: "1px solid #eaeaea" }}>Visualizar</TableCell>
                       <TableCell align="center" sx={{ fontWeight: 600, color: "#666", borderBottom: "1px solid #eaeaea" }}>Criar / Editar</TableCell>
                       <TableCell align="center" sx={{ fontWeight: 600, color: "#666", borderBottom: "1px solid #eaeaea" }}>Excluir</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {modules.map((row) => (
                       <TableRow 
                         key={row.id}
                         sx={{ 
                           '&:hover': { bgcolor: '#fafafa' },
                           transition: 'background-color 0.15s ease',
                         }}
                       >
                         <TableCell sx={{ fontWeight: 600, py: 2, pl: 3, color: "#333", borderBottom: "1px solid #f0f0f0" }}>{row.name}</TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox 
                             checked={row.view} 
                             disabled
                             color="primary" 
                             size="small" 
                           />
                         </TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox 
                             checked={row.edit} 
                             disabled
                             color="primary" 
                             size="small"
                           />
                         </TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox 
                             checked={row.delete} 
                             disabled
                             color="primary" 
                             size="small"
                           />
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TableContainer>

               <Box sx={{ flexGrow: 1, minHeight: 40 }} />
               <Divider sx={{ borderColor: "#f0f0f0" }} />

               <Box sx={{ p: 2.5, display: "flex", justifyContent: "flex-end", gap: 2, bgcolor: "#fafafa", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                 <Typography variant="caption" color="textSecondary">
                   As permissões são fixas para os papéis padrão do sistema.
                 </Typography>
               </Box>
               </>
               )}
             </Paper>
           </Grid>
         </Grid>
         )}
       </Box>
    </Box>

    {/* Create Role Dialog */}
    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#222' }}>Criar Novo Papel</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Nome do Papel (ex: Vendedor)"
                fullWidth
                variant="outlined"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => { setOpenModal(false); setNewRoleName(''); }} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateRole} 
              variant="contained" 
              disabled={!newRoleName.trim()}
              sx={{ bgcolor: "#083927", '&:hover': { bgcolor: '#06291c' }, textTransform: 'none', fontWeight: 600 }}
            >
              Criar
            </Button>
        </DialogActions>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#d32f2f' }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Tem certeza que deseja remover o papel <strong>{menuRole?.nome}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita. Usuários associados a este papel precisarão ser reatribuídos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteRole} 
              variant="contained" 
              color="error"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Remover Papel
            </Button>
        </DialogActions>
    </Dialog>

    {/* Context Menu for role actions */}
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={handleDeleteClick} sx={{ color: '#d32f2f' }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
        </ListItemIcon>
        <ListItemText>Remover Papel</ListItemText>
      </MenuItem>
    </Menu>

    {/* Notifications */}
    <Snackbar 
      open={notification.open} 
      autoHideDuration={4000} 
      onClose={() => setNotification({...notification, open: false})} 
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        severity={notification.severity} 
        sx={{ width: '100%', borderRadius: 2 }}
        onClose={() => setNotification({...notification, open: false})}
      >
        {notification.message}
      </Alert>
    </Snackbar>
   </div>
  );
}
