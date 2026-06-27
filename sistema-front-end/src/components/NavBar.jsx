import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMenu } from "../context/MenuContext";

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
};

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initials, setInitials] = useState("K");
  const [anchorEl, setAnchorEl] = useState(null);
  const [hasAuditAccess, setHasAuditAccess] = useState(false);
  const { handleDrawerToggle } = useMenu();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length > 1) {
        setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
      } else {
        setInitials(name.substring(0, 2).toUpperCase());
      }
    }

    const checkAdmin = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
        }
      } catch (e) {}
      setHasAuditAccess(true); // For now, allow it to render, backend will protect data.
    };
    checkAdmin();
  }, []);

  const pageTitle = routeNames[location.pathname] || "Kamba Gestão";

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
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
          <Box sx={{ display: 'flex', alignItems: 'center', color: "black" }}>
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
              sx={{
                fontWeight: 700,
                color: "#083927",
                display: { xs: "none", sm: "block" },
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
          <Box>
            <List sx={{ display: "flex", alignItems: "center", p: 0 }}>
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
                <Button variant="contained" sx={{ background: "#fff", minWidth: "auto", p: 1 }}>
                  <NotificationsOutlinedIcon
                    sx={{
                      fontSize: "1.5rem",
                      color: "black",
                      borderRadius: "5px",
                    }}
                  />
                </Button>
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
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error" fontWeight="600">Sair</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
