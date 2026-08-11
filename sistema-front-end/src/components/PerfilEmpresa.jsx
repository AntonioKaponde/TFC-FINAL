import {
  Box,
  Card,
  Divider,
  FormControl,
  Grid,
  Typography,
  CircularProgress
} from "@mui/material";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { api } from "../api/client";

const PerfilEmpresa = forwardRef((props, ref) => {
  const [empresa, setEmpresa] = useState({
    nome: "",
    nif: "",
    capitalSocial: "",
    telefone: "",
    email: "",
    endereco: ""
  });
  const [originalEmpresa, setOriginalEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await api.get("/api/empresa/atual");
        const data = {
          id: response.id,
          nome: response.nome || "",
          nif: response.nif || "",
          capitalSocial: response.capitalSocial || "",
          telefone: response.telefone || "",
          email: response.email || "",
          endereco: response.endereco || ""
        };
        setEmpresa(data);
        setOriginalEmpresa(data);
      } catch (error) {
        console.error("Erro ao buscar dados da empresa", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, []);

  // Determina se um campo já foi configurado anteriormente (não pode ser alterado novamente, exceto telefone)
  const jaConfigurado = (campo) => {
    if (!originalEmpresa) return false;
    return originalEmpresa[campo] !== null && originalEmpresa[campo] !== undefined && originalEmpresa[campo] !== '';
  };

  const handleChange = (e) => {
    if (e.target.name === 'capitalSocial' && Number(e.target.value) < 0) {
      return;
    }
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  useImperativeHandle(ref, () => ({
    save: async () => {
      const payload = { telefone: empresa.telefone };
      if (!jaConfigurado('endereco')) payload.endereco = empresa.endereco;
      if (!jaConfigurado('email')) payload.email = empresa.email;
      if (!jaConfigurado('capitalSocial')) payload.capitalSocial = empresa.capitalSocial ? Number(empresa.capitalSocial) : null;

      await api.put(`/api/empresa/atual`, payload);
    }
  }));

  if (loading) return <CircularProgress sx={{ m: 5 }} />;

  return (
    <div>
      <Grid container spacing={2} sx={{ width: "100%" }}>
        <Card sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111' }}>
              Perfil da Empresa
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
            <FormControl sx={{ width: "100%", p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Nome da Empresa<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="text"
                name="nome"
                value={empresa.nome}
                disabled
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, backgroundColor: "#f5f5f5", color: "#666", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                NIF (Número de identificação Fiscal)
                <span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="text"
                name="nif"
                value={empresa.nif}
                disabled
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, backgroundColor: "#f5f5f5", color: "#666", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Capital social (Kz)<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="number"
                min="0"
                name="capitalSocial"
                value={empresa.capitalSocial}
                onChange={handleChange}
                disabled={jaConfigurado('capitalSocial')}
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                style={{ 
                  height: "50px", padding: 10, fontSize: 15, marginTop:5, 
                  border: "1px solid #ccc", borderRadius: "4px",
                  backgroundColor: jaConfigurado('capitalSocial') ? "#f5f5f5" : "#fff",
                  color: jaConfigurado('capitalSocial') ? "#666" : "#000"
                }}
              />
              {jaConfigurado('capitalSocial') && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                </Typography>
              )}
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Telefone<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="text"
                name="telefone"
                value={empresa.telefone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 9) {
                    setEmpresa({ ...empresa, telefone: val });
                  }
                }}
                maxLength={9}
                placeholder="900000000"
                style={{ 
                  height: "50px", padding: 10, fontSize: 15, marginTop:5, 
                  border: "1px solid #ccc", borderRadius: "4px"
                }}
              />
              {empresa.telefone && !/^9\d{8}$/.test(empresa.telefone) && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                  O telefone deve ter 9 dígitos e começar com 9.
                </Typography>
              )}
            </FormControl>
            <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                E-mail de Conta<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="email"
                name="email"
                value={empresa.email}
                onChange={handleChange}
                disabled={jaConfigurado('email')}
                style={{ 
                  height: "50px", padding: 10, fontSize: 15, marginTop:5, 
                  border: "1px solid #ccc", borderRadius: "4px",
                  backgroundColor: jaConfigurado('email') ? "#f5f5f5" : "#fff",
                  color: jaConfigurado('email') ? "#666" : "#000"
                }}
              />
              {jaConfigurado('email') && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                </Typography>
              )}
            </FormControl>
            <FormControl sx={{ width: "100%", p: { xs: 1.5, md: 3 } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Endereço Sede<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="text"
                name="endereco"
                value={empresa.endereco}
                onChange={handleChange}
                disabled={jaConfigurado('endereco')}
                style={{ 
                  height: "50px", padding: 10, fontSize: 15, marginTop:5, 
                  border: "1px solid #ccc", borderRadius: "4px",
                  backgroundColor: jaConfigurado('endereco') ? "#f5f5f5" : "#fff",
                  color: jaConfigurado('endereco') ? "#666" : "#000"
                }}
              />
              {jaConfigurado('endereco') && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
});

export default PerfilEmpresa;
