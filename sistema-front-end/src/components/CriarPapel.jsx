import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShieldOutlineIcon from '@mui/icons-material/ShieldOutlined'; // Se não tiver, pode usar GppGood ou similar
import AddIcon from '@mui/icons-material/Add';
import NavBar from "./NavBar";
import SideBar from './SideBar';

// Módulos base baseados na imagem
const initialModules = [
  { id: 'usuaeio', name: 'Usuário', view: false, createEdit: false, delete: false },
  { id: 'fornecedor', name: 'Fornecedor', view: false, createEdit: false, delete: false },
  { id: 'dashboard', name: 'Dashboard Fiscal', view: false, createEdit: false, delete: false },
  { id: 'faturacao', name: 'Faturação', view: true, createEdit: true, delete: false },
  { id: 'inventario', name: 'Inventário', view: true, createEdit: false, delete: false },
  { id: 'clientes', name: 'Clientes', view: true, createEdit: true, delete: false },
  { id: 'saft', name: 'Ficheiro SAF-T', view: false, createEdit: false, delete: false },
  { id: 'configuracoes', name: 'Configurações', view: false, createEdit: false, delete: false },
];

export default function CriarPapel() {
  const [open, setOpen] = useState(true); // Controla a abertura do modal
  const [roleName, setRoleName] = useState('');
  const [modules, setModules] = useState(initialModules);

  // Manipula a alteração de cada checkbox individualmente
  const handleCheckboxChange = (id, field) => {
    setModules(prevModules =>
      prevModules.map(mod =>
        mod.id === id ? { ...mod, [field]: !mod[field] } : mod
      )
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    const payload = {
      nomePapel: roleName,
      permissoes: modules
    };
    console.log('Dados do Novo Papel:', payload);
    // Adicione aqui a sua lógica de submissão (API call, etc.)
    handleClose();
  };

  return (
   <div>
    <NavBar />
    <Box display={"flex"}>
      <SideBar/>
       <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          padding: '8px'
        }
      }}
    >
      
      {/* Cabeçalho do Modal */}
      <DialogTitle sx={{ m: 0, p: 3, pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Criar Novo Papel
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Defina um nome e configure as permissões por módulo.
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#94a3b8',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Conteúdo Principal */}
      <DialogContent sx={{ p: 3, pt: 1 }}>
        {/* Campo de Texto: Nome do Papel */}
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 1 }}>
            Nome do Papel <span style={{ color: '#ef4444' }}>*</span>
          </Typography>
          <TextField
            fullWidth
            placeholder="Ex: Supervisor de Vendas"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShieldOutlineIcon sx={{ color: '#3b82f6' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '&.Mui-focused fieldset': {
                  borderColor: '#2563eb',
                }
              }
            }}
          />
        </Box>

        {/* Tabela de Permissões de Acesso */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', mb: 2 }}>
            PERMISSÕES DE ACESSO
          </Typography>

          <TableContainer sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>Módulo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>Visualizar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>Criar / Editar</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>Excluir</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child cb, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: '#1e293b', py: 1.5 }}>
                      {row.name}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Checkbox
                        checked={row.view}
                        onChange={() => handleCheckboxChange(row.id, 'view')}
                        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#1d4ed8' } }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Checkbox
                        checked={row.createEdit}
                        onChange={() => handleCheckboxChange(row.id, 'createEdit')}
                        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#1d4ed8' } }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Checkbox
                        checked={row.delete}
                        onChange={() => handleCheckboxChange(row.id, 'delete')}
                        sx={{ color: '#cbd5e1', '&.Mui-checked': { color: '#1d4ed8' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      {/* Ações / Botões do Rodapé */}
      <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid #f1f5f9', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{ 
            borderRadius: '10px', 
            textTransform: 'none', 
            color: '#1e293b', 
            borderColor: '#e2e8f0',
            fontWeight: 600,
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          startIcon={<AddIcon />}
          disableElevation
          sx={{ 
            borderRadius: '10px', 
            textTransform: 'none', 
            backgroundColor: '#1d4ed8',
            fontWeight: 600,
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: '#1e40af'
            }
          }}
        >
          Criar Papel
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
   </div>
  );
}