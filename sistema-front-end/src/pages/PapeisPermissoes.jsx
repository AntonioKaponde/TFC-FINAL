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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
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
  
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/roles');
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        handleSelectRole(data[0]);
      } else if (selectedRole) {
        const updatedSelected = data.find(r => r.id === selectedRole.id);
        if (updatedSelected) handleSelectRole(updatedSelected);
      }
    } catch (error) {
      showNotification('Erro ao carregar papéis', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    
    // Convert permissions array from backend to modules state
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
    
    // Convert modules state to permissions array for backend
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
      showNotification(error.message || 'Erro ao salvar permissões', 'error');
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    
    try {
      await api.post('/api/roles', {
        nome: newRoleName,
        permissoes: []
      });
      setOpenModal(false);
      setNewRoleName('');
      showNotification('Papel criado com sucesso!', 'success');
      fetchRoles();
    } catch (error) {
      showNotification(error.message || 'Erro ao criar papel', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  return (
   <div>
    <NavBar />
    <Box sx={{display:"flex"}}>
      <SideBar />
       <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1,mt:10 }}>
         <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
           <Box>
             <Typography variant="h6" sx={{ fontWeight: 800, color: "#111" }}>
               Papéis e Permissões
             </Typography>
             <Typography variant="caption" color="textSecondary">
               Configure o nível de acesso para cada função do sistema.
             </Typography>
           </Box>
           {roles.length < 4 && (
             <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={() => setOpenModal(true)}
               sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 2.5, boxShadow: "none", bgcolor: "#083927", mr:16 }}
             >
               Criar Novo Papel
             </Button>
           )}
         </Box>

         <Grid container spacing={3}>
           {/* Esquerda: Lista de Papéis */}
           <Grid item xs={12} md={4}>
             <Stack spacing={2} >
               {loading && roles.length === 0 ? <CircularProgress /> : roles.map((role) => {
                 const isSelected = selectedRole?.id === role.id;
                 return (
                   <Card
                     key={role.id}
                     variant="outlined"
                     sx={{
                       borderRadius: 3,
                       border: isSelected ? "2px solid #083927" : "1px solid #e0e0e0",
                       boxShadow: isSelected ? "0px 4px 12px rgba(25, 118, 210, 0.05)" : "none",
                       cursor: "pointer",
                       transition: "all 0.2s ease",
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
                             label={`${role.usersCount} ${role.usersCount === 1 ? "Usuário" : "Usuários"}`}
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
                       <IconButton size="small" sx={{ color: "#888" }}>
                         <MoreVertIcon fontSize="small" />
                       </IconButton>
                     </Box>
                   </Card>
                 );
               })}
             </Stack>
           </Grid>

           {/* Direita: Matriz de Permissões */}
           <Grid item xs={12} md={8}>
             <Paper variant="outlined" sx={{ borderRadius: 3, bgcolor: "#ffffff", display: "flex", flexDirection: "column", height: "100%", width:"65rem" }}>
               <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <Box>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "inline", color: "#222" }}>
                     Permissões:{" "}
                   </Typography>
                   <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#083927", display: "inline" }}>
                     {selectedRole ? selectedRole.nome : 'Selecione um papel'}
                   </Typography>
                   <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                     Selecione quais módulos este papel pode visualizar ou modificar.
                   </Typography>
                 </Box>
               </Box>

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
                       <TableRow key={row.id}>
                         <TableCell sx={{ fontWeight: 600, py: 2, pl: 3, color: "#333", borderBottom: "1px solid #f0f0f0" }}>{row.name}</TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox checked={row.view} onChange={() => handlePermissionChange(row.id, "view")} disabled={!selectedRole} color="primary" size="small" />
                         </TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox checked={row.edit} onChange={() => handlePermissionChange(row.id, "edit")} disabled={!selectedRole} color="primary" size="small" />
                         </TableCell>
                         <TableCell align="center" sx={{ borderBottom: "1px solid #f0f0f0" }}>
                           <Checkbox checked={row.delete} onChange={() => handlePermissionChange(row.id, "delete")} disabled={!selectedRole} color="primary" size="small" />
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TableContainer>

               <Box sx={{ flexGrow: 1, minHeight: 40 }} />
               <Divider sx={{ borderColor: "#f0f0f0" }} />

               <Box sx={{ p: 2.5, display: "flex", justifyContent: "flex-end", gap: 2, bgcolor: "#fafafa", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                 <Button variant="outlined" color="inherit" onClick={() => selectedRole && handleSelectRole(selectedRole)} disabled={!selectedRole} sx={{ textTransform: "none", fontWeight: 600, px: 3, borderRadius: 2, borderColor: "#e0e0e0", bgcolor: "#fff" }}>
                   Descartar Alterações
                 </Button>
                 <Button onClick={handleSavePermissions} disabled={!selectedRole} sx={{ textTransform: "none", fontWeight: 600, px: 3, borderRadius: 2, boxShadow: "none", color:"#fff", bgcolor:"#083927", '&:hover': {bgcolor: '#06291c'} }}>
                   Salvar Permissões
                 </Button>
               </Box>
             </Paper>
           </Grid>
         </Grid>
       </Box>
    </Box>

    {/* Modal Criar Papel */}
    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Criar Novo Papel</DialogTitle>
        <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Nome do Papel (ex: Vendedor)"
                fullWidth
                variant="outlined"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button onClick={handleCreateRole} variant="contained" sx={{ bgcolor: "#083927", '&:hover': {bgcolor: '#06291c'} }}>Criar</Button>
        </DialogActions>
    </Dialog>

    {/* Notificações */}
    <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
    </Snackbar>
   </div>
  );
}