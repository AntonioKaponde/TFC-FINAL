import React, { useState } from "react";
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
  Stack,
  TextField,
  InputAdornment,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  NotificationsNone as NotificationsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  SpaceDashboardOutlined as DashboardIcon,
  ReceiptLongOutlined as FaturacaoIcon,
  Inventory2Outlined as InventarioIcon,
  PeopleAltOutlined as ClientesIcon,
  ManageAccounts as GestaoUserIcon,
  GavelOutlined as PapeisIcon,
  FolderZipOutlined as SaftIcon,
  AssessmentOutlined as RelatoriosIcon,
  SettingsOutlined as ConfigIcon,
  VerifiedUserOutlined as CertifiedIcon,
} from "@mui/icons-material";

// Dados dos papéis (esquerda)
const initialRoles = [
  {
    id: "admin",
    name: "Administrador",
    usersCount: 1,
    labelColor: "#f57c00",
    labelBg: "#fff3e0",
  },
  {
    id: "stock",
    name: "Gestor de Stock",
    usersCount: 2,
    labelColor: "#1976d2",
    labelBg: "#e3f2fd",
  },
  {
    id: "accountant",
    name: "Contabilista",
    usersCount: 1,
    labelColor: "#1976d2",
    labelBg: "#e3f2fd",
  },
  {
    id: "vendor",
    name: "Vendedor",
    usersCount: 2,
    labelColor: "#1976d2",
    labelBg: "#e3f2fd",
  },
];

// Módulos e matriz de permissões (direita)
const initialModules = [
  {
    id: "dashboard",
    name: "Dashboard Fiscal",
    view: true,
    edit: false,
    delete: false,
  },
  {
    id: "faturamento",
    name: "Faturação",
    view: true,
    edit: false,
    delete: false,
  },
  {
    id: "inventario",
    name: "Inventário",
    view: true,
    edit: true,
    delete: true,
  },
  { id: "clientes", name: "Clientes", view: true, edit: true, delete: false },
  {
    id: "saft",
    name: "Ficheiro SAF-T",
    view: false,
    edit: false,
    delete: false,
  },
  {
    id: "config",
    name: "Configurações",
    view: false,
    edit: false,
    delete: false,
  },
];

export default function DashboardPermissoes() {
  const [selectedRole, setSelectedRole] = useState("stock");
  const [modules, setModules] = useState(initialModules);

  const handlePermissionChange = (moduleId, field) => {
    setModules((prev) =>
      prev.map((mod) =>
        mod.id === moduleId ? { ...mod, [field]: !mod[field] } : mod,
      ),
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f9" }}>
      {/* ================= SIDEBAR LATERAL ================= */}
      <Box
        component="aside"
        sx={{
          width: 260,
          bgcolor: "#ffffff",
          borderRight: "1px solid #e0e0e0",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          p: 2,
          justifyContent: "space-between",
        }}
      >
        <Box>
          {/* Logo da Aplicação */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1.5,
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "#1976d2",
                color: "white",
                p: 0.5,
                borderRadius: 1.5,
                display: "flex",
              }}
            >
              <CertifiedIcon fontSize="small" />
            </Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#0d47a1", letterSpacing: 0.5 }}
            >
              AngoFatur
            </Typography>
          </Box>

          {/* Grupo: Visão Geral */}
          <List disablePadding>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                mb: 1,
              }}
            >
              VISÃO GERAL
            </Typography>
            {[
              {
                text: "Dashboard Fiscal",
                icon: <DashboardIcon fontSize="small" />,
              },
              { text: "Faturação", icon: <FaturacaoIcon fontSize="small" /> },
              { text: "Inventário", icon: <InventarioIcon fontSize="small" /> },
              { text: "Clientes", icon: <ClientesIcon fontSize="small" /> },
            ].map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: "#666" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#444",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Grupo: Administração */}
            <Typography
              variant="caption"
              sx={{
                px: 2,
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                mt: 3,
                mb: 1,
              }}
            >
              ADMINISTRAÇÃO
            </Typography>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 36, color: "#666" }}>
                  <GestaoUserIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Gestão de Usuários"
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  bgcolor: "#1976d2 !important",
                  color: "white",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <PapeisIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Papéis e Permissões"
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>

            {/* Grupo: Conformidade AGT */}
            <Typography
              variant="caption"
              sx={{
                px: 2,
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                mt: 3,
                mb: 1,
              }}
            >
              CONFORMIDADE AGT
            </Typography>
            {[
              { text: "Ficheiro SAF-T", icon: <SaftIcon fontSize="small" /> },
              {
                text: "Relatórios de Imposto",
                icon: <RelatoriosIcon fontSize="small" />,
              },
              { text: "Configurações", icon: <ConfigIcon fontSize="small" /> },
            ].map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton sx={{ borderRadius: 2, py: 1, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: "#666" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#444",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Rodapé da Sidebar - Software Certificado AGT */}
        <Box
          sx={{
            bgcolor: "#e3f2fd",
            p: 1.5,
            borderRadius: 2.5,
            border: "1px solid #bbdefb",
            mt: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CertifiedIcon sx={{ color: "#1976d2" }} fontSize="small" />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#0d47a1" }}
            >
              Software Certificado
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            display="block"
            sx={{ color: "#1565c0", fontSize: 10, mt: 0.5, fontWeight: 500 }}
          >
            AGT N.º 345/C/2024
          </Typography>
        </Box>
      </Box>

      {/* ================= CONTEÚDO PRINCIPAL (TOPBAR + ÁREA DE TRABALHO) ================= */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar / Barra Superior de Navegação */}
        <Box
          component="header"
          sx={{
            height: 70,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#222" }}
          >
            Administração
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Input de Pesquisa Contextual */}
            <TextField
              size="small"
              placeholder="Pesquisar usuários..."
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f4f6f9",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Notificações */}
            <IconButton size="small" sx={{ color: "#555" }}>
              <Badge color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Informações do Administrador */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, fontSize: 13, color: "#333" }}
                >
                  João Manuel
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "block", mt: -0.2 }}
                >
                  Administrador
                </Typography>
              </Box>
              <Avatar
                src="https://i.pravatar.cc/150?u=4"
                sx={{ width: 36, height: 36, borderRadius: 2 }}
                variant="rounded"
              />
            </Stack>
          </Box>
        </Box>

        {/* Espaço de Trabalho Configuração de Papéis */}
        <Box component="main" sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
          {/* Subheader Interno */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#111" }}>
                Papéis e Permissões
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Configure o nível de acesso para cada função do sistema.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                boxShadow: "none",
                bgcolor: "#1976d2",
              }}
            >
              Criar Novo Papel
            </Button>
          </Box>

          {/* Painel Bifurcado (Lista de Papéis + Tabela de Permissões) */}
          <Grid container spacing={3}>
            {/* Esquerda: Lista de Funções Cadastradas */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                {initialRoles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <Card
                      key={role.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        border: isSelected
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                        boxShadow: isSelected
                          ? "0px 4px 12px rgba(25, 118, 210, 0.05)"
                          : "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#222" }}
                          >
                            {role.name}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 1.5 }}
                          >
                            <Chip
                              label={`${role.usersCount} ${role.usersCount === 1 ? "Usuário" : "Usuários"}`}
                              size="small"
                              sx={{
                                bgcolor: isSelected ? "#e3f2fd" : role.labelBg,
                                color: isSelected ? "#1976d2" : role.labelColor,
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: "6px",
                                height: 22,
                              }}
                            />
                            {isSelected && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#1976d2",
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              >
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

            {/* Direita: Matriz de Definições de Permissão */}
            <Grid item xs={12} md={8}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Header da Matriz */}
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, display: "inline", color: "#222" }}
                    >
                      Permissões:{" "}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1976d2",
                        display: "inline",
                      }}
                    >
                      {initialRoles.find((r) => r.id === selectedRole)?.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="textSecondary"
                      sx={{ mt: 0.5 }}
                    >
                      Selecione quais módulos este papel pode visualizar ou
                      modificar.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#1976d2",
                      fontSize: 12,
                    }}
                  >
                    Renomear Papel
                  </Button>
                </Box>

                {/* Tabela Estruturada */}
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: "#666",
                            py: 1.5,
                            pl: 3,
                            borderBottom: "1px solid #eaeaea",
                          }}
                        >
                          Módulo
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            color: "#666",
                            borderBottom: "1px solid #eaeaea",
                          }}
                        >
                          Visualizar
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            color: "#666",
                            borderBottom: "1px solid #eaeaea",
                          }}
                        >
                          Criar / Editar
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            color: "#666",
                            borderBottom: "1px solid #eaeaea",
                          }}
                        >
                          Excluir
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modules.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              py: 2,
                              pl: 3,
                              color: "#333",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            {row.name}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <Checkbox
                              checked={row.view}
                              onChange={() =>
                                handlePermissionChange(row.id, "view")
                              }
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <Checkbox
                              checked={row.edit}
                              onChange={() =>
                                handlePermissionChange(row.id, "edit")
                              }
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ borderBottom: "1px solid #f0f0f0" }}
                          >
                            <Checkbox
                              checked={row.delete}
                              onChange={() =>
                                handlePermissionChange(row.id, "delete")
                              }
                              color="primary"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Espaçador Flex para fixar as ações no rodapé */}
                <Box sx={{ flexGrow: 1, minHeight: 40 }} />
                <Divider sx={{ borderColor: "#f0f0f0" }} />

                {/* Rodapé Operacional */}
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    bgcolor: "#fafafa",
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      borderRadius: 2,
                      borderColor: "#e0e0e0",
                      bgcolor: "#fff",
                    }}
                  >
                    Descartar Alterações
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: "none",
                    }}
                  >
                    Salvar Permissões
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
