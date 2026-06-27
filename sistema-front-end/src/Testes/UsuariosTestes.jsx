import React from 'react';
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
  TextField,
  InputAdornment,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  NotificationsNone as NotificationsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  EditOutlined as EditIcon,
  VpnKeyOutlined as KeyIcon,
  SpaceDashboardOutlined as DashboardIcon,
  ReceiptLongOutlined as FaturacaoIcon,
  Inventory2Outlined as InventarioIcon,
  PeopleAltOutlined as ClientesIcon,
  ManageAccounts as GestaoUserIcon,
  GavelOutlined as PapeisIcon,
  FolderZipOutlined as SaftIcon,
  AssessmentOutlined as RelatoriosIcon,
  SettingsOutlined as ConfigIcon,
  VerifiedUserOutlined as CertifiedIcon
} from '@mui/icons-material';

// Dados dos cards de usuários
const users = [
  { id: 1, name: "Maria Fernandes", email: "maria.f@angofatur.ao", role: "Gestor de Stock", status: "Ativo", img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Carlos Mendes", email: "carlos.m@angofatur.ao", role: "Contabilista", status: "Ativo", img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Ana Paulo", email: "ana.p@angofatur.ao", role: "Vendedor", status: "Inativo", img: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "João Manuel", email: "joao.m@angofatur.ao", role: "Administrador", status: "Ativo", img: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Teresa Silva", email: "teresa.s@angofatur.ao", role: "Vendedor", status: "Ativo", img: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Pedro Costa", email: "pedro.c@angofatur.ao", role: "Gestor de Stock", status: "Ativo", img: "https://i.pravatar.cc/150?u=6" },
];

export default function DashboardUsuarios() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f9' }}>
      
      {/* ================= SIDEBAR LATERAL ================= */}
      <Box 
        component="aside" 
        sx={{ 
          width: 260, 
          bgcolor: '#ffffff', 
          borderRight: '1px solid #e0e0e0',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 2,
          justifyContent: 'space-between'
        }}
      >
        <Box>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, mb: 3 }}>
            <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 0.5, borderRadius: 1.5, display: 'flex' }}>
              <CertifiedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0d47a1', letterSpacing: 0.5 }}>
              AngoFatur
            </Typography>
          </Box>

          {/* Menus de Navegação */}
          <List disablePadding>
            <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              VISÃO GERAL
            </Typography>
            {[
              { text: 'Dashboard Fiscal', icon: <DashboardIcon fontSize="small" /> },
              { text: 'Faturação', icon: <FaturacaoIcon fontSize="small" /> },
              { text: 'Inventário', icon: <InventarioIcon fontSize="small" /> },
              { text: 'Clientes', icon: <ClientesIcon fontSize="small" /> },
            ].map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#444' }} />
                </ListItemButton>
              </ListItem>
            ))}

            <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: 'text.secondary', display: 'block', mt: 3, mb: 1 }}>
              ADMINISTRAÇÃO
            </Typography>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton selected sx={{ borderRadius: 2, py: 1, px: 2, bgcolor: '#1976d2 !important', color: 'white' }}>
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><GestaoUserIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Gestão de Usuários" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 36, color: '#666' }}><PapeisIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Papéis e Permissões" primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#444' }} />
              </ListItemButton>
            </ListItem>

            <Typography variant="caption" sx={{ px: 2, fontWeight: 700, color: 'text.secondary', display: 'block', mt: 3, mb: 1 }}>
              CONFORMIDADE AGT
            </Typography>
            {[
              { text: 'Ficheiro SAF-T', icon: <SaftIcon fontSize="small" /> },
              { text: 'Relatórios de Imposto', icon: <RelatoriosIcon fontSize="small" /> },
              { text: 'Configurações', icon: <ConfigIcon fontSize="small" /> },
            ].map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: '#666' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: '#444' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Card do Software Certificado AGT */}
        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2.5, border: '1px solid #bbdefb', mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CertifiedIcon sx={{ color: '#1976d2' }} fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d47a1' }}>
              Software Certificado
            </Typography>
          </Stack>
          <Typography variant="caption" display="block" sx={{ color: '#1565c0', fontSize: 10, mt: 0.5, fontWeight: 500 }}>
            AGT N.º 345/C/2024
          </Typography>
        </Box>
      </Box>

      {/* ================= CONTEÚDO PRINCIPAL (BARRA SUPERIOR + GRID) ================= */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Topbar / Barra de Cima */}
        <Box 
          component="header" 
          sx={{ 
            height: 70, 
            bgcolor: '#ffffff', 
            borderBottom: '1px solid #e0e0e0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 }
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222' }}>
            Gestão de Usuários
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Input de Pesquisa */}
            <TextField 
              size="small"
              placeholder="Pesquisar usuários..."
              sx={{ width: 280, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f4f6f9' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Ícone Notificação */}
            <IconButton size="small" sx={{ color: '#555' }}>
              <Badge color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Avatar do Administrador Logado */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13, color: '#333' }}>
                  João Manuel
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: -0.2 }}>
                  Administrador
                </Typography>
              </Box>
              <Avatar src="https://i.pravatar.cc/150?u=4" sx={{ width: 36, height: 36, borderRadius: 2 }} variant="rounded" />
            </Stack>
          </Box>
        </Box>

        {/* Área Central dos Cards */}
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          
          {/* Header Interno do Grid */}
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
              startIcon={<AddIcon />} 
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5, boxShadow: 'none', bgcolor: '#1976d2' }}
            >
              Adicionar Usuário
            </Button>
          </Box>

          {/* Grid de Usuários */}
          <Grid container spacing={3}>
            {users.map((user) => {
              const isActive = user.status === "Ativo";
              return (
                <Grid item xs={12} sm={6} lg={4} key={user.id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, p: 2.5, position: 'relative', bgcolor: '#ffffff' }}>
                    
                    {/* Menu Kebab superior direito */}
                    <IconButton size="small" sx={{ position: 'absolute', top: 12, right: 12, color: '#888' }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    {/* Perfil e Identificação */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                      <Avatar src={user.img} sx={{ width: 56, height: 56, borderRadius: 2.5 }} variant="rounded" />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222', lineHeight: 1.2 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                          {user.email}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={user.role} 
                            size="small" 
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 600, borderRadius: '6px', fontSize: 11, height: 22 }} 
                          />
                          <Chip 
                            label={user.status} 
                            size="small" 
                            sx={{ 
                              bgcolor: isActive ? '#e8f5e9' : '#ffebee', 
                              color: isActive ? '#2e7d32' : '#c62828', 
                              fontWeight: 600, 
                              borderRadius: '6px',
                              fontSize: 11,
                              height: 22
                            }} 
                          />
                        </Stack>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: '#f0f0f0' }} />

                    {/* Botões de Ação Inferiores */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                      <Button 
                        startIcon={<EditIcon sx={{ width: 16, height: 16 }} />} 
                        size="small" 
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#1976d2', fontSize: 12 }}
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
                    </Box>

                  </Card>
                </Grid>
              );
            })}
          </Grid>

        </Box>
      </Box>

</Box>
  );
}