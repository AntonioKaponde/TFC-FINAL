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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await api.get("/api/empresa/atual");
        setEmpresa({
          id: response.id,
          nome: response.nome || "",
          nif: response.nif || "",
          capitalSocial: response.capitalSocial || "",
          telefone: response.telefone || "",
          email: response.email || "",
          endereco: response.endereco || ""
        });
      } catch (error) {
        console.error("Erro ao buscar dados da empresa", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'capitalSocial' && Number(e.target.value) < 0) {
      return;
    }
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  useImperativeHandle(ref, () => ({
    save: async () => {
      await api.put(`/api/empresa/atual`, {
        endereco: empresa.endereco,
        telefone: empresa.telefone,
        email: empresa.email,
        capitalSocial: empresa.capitalSocial ? Number(empresa.capitalSocial) : null
      });
    }
  }));

  if (loading) return <CircularProgress sx={{ m: 5 }} />;

  return (
    <div>
      <Grid container spacing={2}>
        <Card sx={{ p: 4, width: "60em", ml: 10 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111' }}>
              Perfil da Empresa
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid sx={{ alignItems: "center" }}>
            <FormControl sx={{ width: "56rem", p: 3 }}>
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
            <FormControl sx={{ width: "28rem", p: 3 }}>
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
            <FormControl sx={{ width: "28rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Capital social (Kz)<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="number"
                min="0"
                name="capitalSocial"
                value={empresa.capitalSocial}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
            <FormControl sx={{ width: "28rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Telefone<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="number"
                min="0"
                name="telefone"
                value={empresa.telefone}
                onChange={handleChange}
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
            <FormControl sx={{ width: "28rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                E-mail de Conta<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="email"
                name="email"
                value={empresa.email}
                onChange={handleChange}
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
            <FormControl sx={{ width: "56rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Endereço Sede<span style={{ color: "red" }}>*</span>
              </Typography>
              <input
                type="text"
                name="endereco"
                value={empresa.endereco}
                onChange={handleChange}
                style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5, border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </FormControl>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
});

export default PerfilEmpresa;
