import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  Security,
  CheckCircleOutline
} from '@mui/icons-material';
import { usuariosApi } from '../api';
import { obterRoles, obterPrimeiroAcesso, removerPrimeiroAcesso } from '../utils/authStorage';
import { destinoPadrao } from '../utils/roles';

export default function AlterarPassword() {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // true quando o utilizador foi criado pelo Admin e ainda não trocou a palavra-passe
  const forcarTroca = obterPrimeiroAcesso();

  const irParaPainel = () => {
    navigate(destinoPadrao(obterRoles()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!forcarTroca && !senhaAtual) {
      setError('Introduza a sua palavra-passe atual.');
      return;
    }
    if (novaSenha.length < 8) {
      setError('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setError('A confirmação não coincide com a nova palavra-passe.');
      return;
    }

    setLoading(true);
    try {
      await usuariosApi.alterarPassword({ senhaAtual, novaSenha });
      removerPrimeiroAcesso();
      setSnackbar({ open: true, message: 'Palavra-passe alterada com sucesso!', severity: 'success' });
      setTimeout(irParaPainel, 1200);
    } catch (err) {
      setError(err.message || 'Não foi possível alterar a palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3 }, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <Paper elevation={0} sx={{ maxWidth: 520, width: '100%', borderRadius: 3, border: '1px solid #E2E8F0', p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{ bgcolor: '#083927', p: 1.2, borderRadius: 1.5, display: 'flex' }}>
            <Security sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Kamba Gestão
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Segurança da conta
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          {forcarTroca ? 'Defina a sua nova palavra-passe' : 'Alterar palavra-passe'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          {forcarTroca
            ? 'Para aceder ao sistema, defina uma palavra-passe pessoal. A palavra-passe atribuída pelo administrador deixará de funcionar.'
            : 'Escolha uma nova palavra-passe para a sua conta. Recomendamos pelo menos 8 caracteres.'}
        </Typography>

        {forcarTroca && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}>
            Primeiro acesso: a troca de palavra-passe é <strong>obrigatória</strong> para continuar.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
            Palavra-passe atual
          </Typography>
          <TextField
            fullWidth
            type={showCurrent ? 'text' : 'password'}
            variant="outlined"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Introduza a palavra-passe atual"
            sx={{ mb: 2.5 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                    {showCurrent ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: 8 }
            }}
          />

          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
            Nova palavra-passe
          </Typography>
          <TextField
            fullWidth
            type={showNew ? 'text' : 'password'}
            variant="outlined"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            sx={{ mb: 2.5 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: 8 }
            }}
          />

          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
            Confirmar nova palavra-passe
          </Typography>
          <TextField
            fullWidth
            type={showConfirm ? 'text' : 'password'}
            variant="outlined"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Repita a nova palavra-passe"
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { borderRadius: 8 }
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontWeight: 500 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#083927',
              '&:hover': { bgcolor: '#0B6E4F' },
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2
            }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
          >
            {loading ? 'A alterar...' : forcarTroca ? 'Alterar e entrar' : 'Alterar palavra-passe'}
          </Button>

          {!forcarTroca && (
            <Button fullWidth variant="text" onClick={() => navigate(-1)} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600, color: '#64748B' }}>
              Voltar
            </Button>
          )}
        </Box>

        {!forcarTroca && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap', bgcolor: '#EFF6FF', p: 2, borderRadius: 2, mt: 3, border: '1px solid #DBEAFE' }}>
            <CheckCircleOutline sx={{ color: '#083927', fontSize: 20, mt: 0.2 }} />
            <Typography variant="caption" sx={{ color: '#083927' }}>
              A alteração fica registada no histórico de auditoria para fins de segurança.
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
