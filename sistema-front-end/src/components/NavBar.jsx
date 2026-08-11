import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import LockResetIcon from "@mui/icons-material/LockReset";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import { useMenu } from "../context/MenuContext";
import { useNotificacoes } from "../context/NotificacoesContext";
import { obterNome, limparSessao } from "../utils/authStorage";

/** Tempo relativo simples, ex.: "há 5 min", "há 2 h", "há 3 dias" */
function tempoRelativo(dataIso) {
  if (!dataIso) return "";
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

const routeNames = {
  "/dashboard": "Dashboard Fiscal",
  "/faturacao": "Facturação",
  "/inventario": "Inventário",
  "/clientes": "Clientes",
  "/fornecedores": "Fornecedores",
  "/gestaoUsuarios": "Gestão de Usuários",
  "/permissoes": "Papéis e Permissões",
  "/ficheiro": "Ficheiro SAF-T",
  "/relatorio": "Relatórios de Imposto",
  "/configuracoes": "Configurações",
  "/auditoria": "Histórico de Auditoria",
  "/alterar-password": "Alterar Palavra-passe",
  "/suporte": "Pedido de Suporte",
  "/gestaoSuporte": "Gestão de Suporte",
  "/inteligencia-fiscal": "Inteligência Fiscal",
  "/previsao-stock": "Previsão de Stock",
};

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initials] = useState(() => {
    const name = obterNome();
    if (!name) return "K";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  });
  const [hasAuditAccess] = useState(true); // renderiza; o backend protege os dados
  const [anchorEl, setAnchorEl] = useState(null);
  const [bellEl, setBellEl] = useState(null);
  const { handleDrawerToggle } = useMenu();
  const { naoLidos, ultimosPedidos } = useNotificacoes();

  const pageTitle = routeNames[location.pathname] || "Kamba Gestão";

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    limparSessao();
    navigate("/");
  };

  const handleBellClick = (event) => {
    setBellEl(event.currentTarget);
  };

  const handleBellClose = () => {
    setBellEl(null);
  };

  const irParaGestaoSuporte = () => {
    handleBellClose();
    navigate("/gestaoSuporte");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { xs: '100%', md: `calc(100% - 300px)` }, 
          ml: { xs: 0, md: `300px` },
          boxShadow: 'none',
          bgcolor: 'transparent'
        }}
      >
        <Toolbar
          sx={{
            background: "#F7FAFC",
            justifyContent: "space-between",
            height: "70px",
            borderBottom: "1px solid #e0e0e0"
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: "black", minWidth: 0 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontWeight: 700,
                color: "#083927",
                fontSize: { xs: "0.95rem", sm: "1rem" },
                minWidth: 0,
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
          <Box>
            <List sx={{ display: "flex", alignItems: "center", p: 0, flexShrink: 0 }}>
              <ListItem sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Paper
                  component="form"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: { sm: 200, md: 250 },
                  }}
                >
                  <IconButton sx={{ p: "5px" }} aria-label="menu">
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Pesquisar..."
                  />
                </Paper>
              </ListItem>
              <ListItem sx={{ px: { xs: 0.5, sm: 2 } }}>
                <Tooltip title={naoLidos > 0 ? `${naoLidos} pedido(s) de suporte por ler` : "Notificações"}>
                  <IconButton onClick={handleBellClick} sx={{ background: "#fff", minWidth: "auto", p: 1, '&:hover': { background: "#F1F5F9" } }}>
                    <Badge badgeContent={naoLidos} color="error" overlap="circular" max={99}>
                      <NotificationsOutlinedIcon
                        sx={{
                          fontSize: "1.5rem",
                          color: "black",
                          borderRadius: "5px",
                        }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.5, sm: 1 }, my: 2 }} />
              <ListItem
                sx={{
                  borderRadius: "20px",
                  color: "black",
                  margin: { xs: 0, sm: "10px" },
                  cursor: "pointer",
                  px: { xs: 0.5, sm: 2 }
                }}
                onClick={handleMenuClick}
              >
                <Avatar sx={{ bgcolor: "#083927", color: "white" }}>{initials}</Avatar>
              </ListItem>
            </List>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 220,
            borderRadius: 2
          },
        }}
      >
        {hasAuditAccess && (
          <MenuItem onClick={() => { handleMenuClose(); navigate('/auditoria'); }}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" fontWeight="600">Auditoria</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleMenuClose(); navigate('/alterar-password'); }}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight="600">Alterar palavra-passe</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error" fontWeight="600">Sair</Typography>
        </MenuItem>
      </Menu>

      {/* Menu de Notificações de Suporte */}
      <Menu
        anchorEl={bellEl}
        open={Boolean(bellEl)}
        onClose={handleBellClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: { xs: 'calc(100vw - 32px)', sm: 340 },
            maxWidth: 340,
            borderRadius: 2
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight="700">Pedidos de suporte</Typography>
          {naoLidos > 0 && (
            <Chip size="small" label={`${naoLidos} novo(s)`} sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, height: 20, fontSize: 11 }} />
          )}
        </Box>
        {naoLidos === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">Sem novas notificações</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {ultimosPedidos.map((pedido) => (
              <MenuItem key={pedido.id} onClick={irParaGestaoSuporte} sx={{ whiteSpace: 'normal', alignItems: 'flex-start', py: 1.25 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#083927' }}>{pedido.codigo}</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>{tempoRelativo(pedido.dataCriacao)}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="600" sx={{ color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 290 }}>
                    {pedido.assunto}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 290 }}>
                    {pedido.descricao}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
        {naoLidos > 0 && (
          <Box sx={{ p: 1, borderTop: '1px solid #F1F5F9' }}>
            <Button fullWidth size="small" onClick={irParaGestaoSuporte} sx={{ textTransform: 'none', fontWeight: 700, color: '#083927' }}>
              Ver todos os pedidos
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
}

export default memo(NavBar);
