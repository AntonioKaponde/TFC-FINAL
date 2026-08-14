import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import { obterRoles, limparSessao } from "../utils/authStorage";
import { ehGestorEstoque } from "../utils/roles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import BusinessIcon from '@mui/icons-material/Business';
import { useMenu } from "../context/MenuContext";
import { useNotificacoes } from "../context/NotificacoesContext";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SupportIcon from '@mui/icons-material/LiveHelp';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const drawerWidth = 300;


function SideBar() {

  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { mobileOpen, handleDrawerToggle } = useMenu();
  const { naoLidos } = useNotificacoes();

  const userRoles = obterRoles();
  const isOperador = userRoles.some(r => r.toUpperCase() === 'OPERADOR' || r.toUpperCase() === 'VENDEDOR');
  const isContabilista = userRoles.some(r => r.toUpperCase() === 'CONTABILISTA');
  const isGestorEstoque = userRoles.some(r => r.toUpperCase() === 'GERENTE' || r.toUpperCase() === 'GERENTE DE ESTOQUE');
  const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');
  const isGerente = userRoles.some(r => r.toUpperCase() === 'GERENTE');

  const handleLogout = () => {
    limparSessao();
    navigate('/');
  };

  const drawerContent = (
    <Box
      sx={{
        overflow: "auto",
        background: "#0B1220",
        height: "100%",
        color: "#fff",
      }}
    >
      <Box
        sx={{ margin: { xs: "24px 16px", md: "30px 30px" }, display: "flex", alignItems: "center" }}
      >
        <Typography
          sx={{ margin: "0px 13px", fontSize: { xs: "1.25em", md: "1.5em" }, fontWeight: "bold" }}
        >
          Kamba Gestão
        </Typography>
      </Box>
      <List sx={{ m: 1 }}>
        <Typography sx={{ margin: { xs: "0px 24px", md: "0px 35px" }, fontWeight: "bold" }}>
          VISÃO GERAL
        </Typography>
        {!isOperador && !isGerente && (
          <ListItem
            onClick={() => {
              navigate("/resumo-empresa");
              if(mobileOpen) handleDrawerToggle();
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: "10px",
                ":hover": { background: "#083927" },
              }}
            >
              <BusinessIcon sx={{ mr: 1 }} />
              Resumo da Empresa
            </ListItemButton>
          </ListItem>
        )}
        {!isOperador && !ehGestorEstoque(userRoles) && (
          <ListItem
            onClick={() => {
              navigate("/dashboard");
              if(mobileOpen) handleDrawerToggle();
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: "10px",
                ":hover": { background: "#083927" },
              }}
            >
              <DashboardOutlinedIcon sx={{ mr: 2 }} />
              Dashboard Fiscal
            </ListItemButton>
          </ListItem>
        )}
        {!ehGestorEstoque(userRoles) && !isContabilista && (
        <ListItem
          onClick={() => {
            navigate("/faturacao");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <DescriptionOutlinedIcon sx={{ mr: 2 }} />
            Facturação
          </ListItemButton>
        </ListItem>
        )}
        {!isContabilista && (
        <ListItem
          onClick={() => {
            navigate("/inventario");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <Inventory2OutlinedIcon sx={{ mr: 2 }} />
            Inventário
          </ListItemButton>
        </ListItem>
        )}
        {!isOperador && !isContabilista && (
        <ListItem
          onClick={() => {
            navigate("/previsao-stock");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <QueryStatsIcon sx={{ mr: 2 }} />
            Previsão de Stock
          </ListItemButton>
        </ListItem>
        )}
        {!isOperador && !isContabilista && (
        <ListItem
          onClick={() => {
            navigate("/categorias");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <CategoryIcon  sx={{  mr: 1 }} />
            <Typography sx={{ fontSize: '0.95rem' }}>Categorias</Typography>
          </ListItemButton>
        </ListItem>
        )}
        {!ehGestorEstoque(userRoles) && (
        <ListItem
          onClick={() => {
            navigate("/clientes");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <PeopleAltOutlinedIcon sx={{ mr: 2 }} />
            Clientes
          </ListItemButton>
        </ListItem>
        )}
        {!isOperador && (
        <ListItem
          onClick={() => {
            navigate("/fornecedores");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <LocalShippingOutlinedIcon sx={{ mr: 2 }} />
            Fornecedores
          </ListItemButton>
        </ListItem>
        )}
      </List>
      
      {isAdmin && (
        <>
          <Divider sx={{ color: "#fff" }} />
          <Typography sx={{ margin: { xs: "0px 24px", md: "0px 35px" }, fontWeight: "bold" }}>
            ADMINISTRAÇÃO
          </Typography>
          <List sx={{ m: 1 }}>
            <ListItem
              onClick={() => {
                navigate("/gestaoUsuarios");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <ManageAccountsOutlinedIcon sx={{ mr: 2 }} />
                Gestão de Usuários
              </ListItemButton>
            </ListItem>
            <ListItem
              onClick={() => {
                navigate("/permissoes");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <SecurityOutlinedIcon sx={{ mr: 2 }} />
                Papéis e Permissões
              </ListItemButton>
            </ListItem>
            <ListItem
              onClick={() => {
                navigate("/auditoria");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <HistoryIcon sx={{ mr: 2 }} />
                Histórico de Auditoria
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

      {!isOperador && !isGerente && (
        <>
          <Divider sx={{ color: "#fff" }} />
          <Typography sx={{ margin: { xs: "0px 24px", md: "0px 35px" }, fontWeight: "bold" }}>
            CONFORMIDADE COM AGT
          </Typography>
          <List sx={{ m: 1 }}>
            <ListItem
              onClick={() => {
                navigate("/ficheiro");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <CloudDownloadOutlinedIcon sx={{ mr: 2 }} />
                Ficheiro SAF-T
              </ListItemButton>
            </ListItem>
            <ListItem
              onClick={() => {
                navigate("/relatorio");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <AssessmentOutlinedIcon sx={{ mr: 2 }} />
                Relatórios de Imposto
              </ListItemButton>
            </ListItem>
            {!isGestorEstoque && (
            <ListItem
              onClick={() => {
                navigate("/inteligencia-fiscal");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <LightbulbOutlinedIcon sx={{ mr: 2 }} />
                Inteligência Fiscal
              </ListItemButton>
            </ListItem>
            )}
            {isAdmin && (
            <ListItem
              onClick={() => {
                navigate("/configuracoes");
                if(mobileOpen) handleDrawerToggle();
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: "10px",
                  ":hover": { background: "#083927" },
                }}
              >
                <SettingsOutlinedIcon sx={{ mr: 2 }} />
                Configurações
              </ListItemButton>
            </ListItem>
            )}
          </List>
        </>
      )}

      {/* SUPORTE */}
      <Divider sx={{ color: "#fff" }} />
      <Typography sx={{ margin: { xs: "0px 24px", md: "0px 35px" }, fontWeight: "bold" }}>
        SUPORTE
      </Typography>
      <List sx={{ m: 1 }}>
        <ListItem
          onClick={() => {
            navigate("/suporte");
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              ":hover": { background: "#083927" },
            }}
          >
            <SupportIcon sx={{ mr: 2 }} />
            Pedido de Suporte
          </ListItemButton>
        </ListItem>
        {isAdmin && (
          <ListItem
            onClick={() => {
              navigate("/gestaoSuporte");
              if(mobileOpen) handleDrawerToggle();
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: "10px",
                ":hover": { background: "#083927" },
              }}
            >
              <SupportAgentIcon sx={{ mr: 2 }} />
              Gestão de Suporte
              {naoLidos > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: "auto", mr: 1, bgcolor: "#EF4444", color: "#fff",
                    borderRadius: "10px", fontSize: "11px", fontWeight: 700,
                    px: "7px", py: "2px", lineHeight: 1.4
                  }}
                >
                  {naoLidos}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider sx={{ color: "#fff" }} />
      <List sx={{ m: 1, mt: 4 }}>
        <ListItem
          onClick={() => {
            setOpenLogoutDialog(true);
            if(mobileOpen) handleDrawerToggle();
          }}
        >
          <ListItemButton
            sx={{
              borderRadius: "10px",
              color: "#ffcccc",
              ":hover": { background: "#083927", color: "#fff" },
            }}
          >
            <LogoutOutlinedIcon sx={{ mr: 2 }} />
            Terminar Sessão
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <CssBaseline />
      
      {/* Drawer Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: {
            width: { xs: 280, sm: drawerWidth },
            boxSizing: "border-box",
            background: "#0B1220",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#0B1220",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      {/* Modal de Confirmação de Logout */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Terminar Sessão?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja sair do sistema? Será necessário introduzir as suas credenciais novamente para aceder ao painel.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenLogoutDialog(false)} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleLogout} variant="contained" sx={{ bgcolor: "#d32f2f", '&:hover': {bgcolor: '#b71c1c'}, textTransform: 'none', fontWeight: 600 }} autoFocus>
            Sim, terminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default memo(SideBar);
