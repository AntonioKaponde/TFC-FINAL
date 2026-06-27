import {
  Box,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { configuracaoFiscalApi } from "../api";
import { regimeIvaFromSelect, taxaFromRegime } from "../utils/formatters";

const regimeToSelect = {
  GERAL: "geral",
  SIMPLIFICADO: "simplificado",
  EXCLUSAO: "M10",
};

const ConfiguracoesFiscais = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    regime: "geral",
    motivoIsencao: "M00",
    aplicarIrt: true,
    aplicarImpostoSelo: false,
  });

  useEffect(() => {
    configuracaoFiscalApi
      .obter()
      .then((data) => {
        setForm({
          regime: regimeToSelect[data.regimeIva] ?? "geral",
          motivoIsencao: data.motivoIsencaoPadrao ?? "M00",
          aplicarIrt: data.aplicarIrt,
          aplicarImpostoSelo: data.aplicarImpostoSelo,
        });
      })
      .catch(() => console.error("Não foi possível carregar a configuração fiscal."))
      .finally(() => setLoading(false));
  }, []);

  useImperativeHandle(ref, () => ({
    save: async () => {
      const regimeIva = regimeIvaFromSelect(form.regime);
      await configuracaoFiscalApi.salvar({
        regimeIva,
        taxaIva: taxaFromRegime(regimeIva),
        motivoIsencaoPadrao: form.motivoIsencao,
        aplicarIrt: form.aplicarIrt,
        aplicarImpostoSelo: form.aplicarImpostoSelo,
      });
    }
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress sx={{ color: '#0B6E4F' }} />
      </Box>
    );
  }

  return (
    <div>
      <Grid container spacing={2}>
        <Card sx={{ p: 4, width: "60em", ml: 10 }}>
          <Box>
            <Typography variant="subtitle" sx={{ fontWeight: 800, color: '#111' }}>
              Configurações Fiscais
            </Typography>
          </Box>
          <Divider />
          <Grid sx={{ alignItems: "center" }}>
           {/*} <FormControl sx={{ width: "56rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Regime do IVA<span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                value={form.regime}
                onChange={(e) => setForm({ ...form, regime: e.target.value })}
                sx={{ height: "50px", fontSize: 15, marginTop: 1 }}
              >
                <MenuItem value="geral">Regime Geral(14%)</MenuItem>
                <MenuItem value="simplificado">Regime Simplicado(7%)</MenuItem>
                <MenuItem value="M10"> Regime de Exclusão</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "56rem", p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                Motivo de Isenção Padrão<span style={{ color: "red" }}>*</span>
              </Typography>
              {/*<Select
                value={form.motivoIsencao}
                onChange={(e) => setForm({ ...form, motivoIsencao: e.target.value })}
                sx={{ height: "50px", fontSize: 15, marginTop: 1 }}
              >
                <MenuItem value="M00">M00 - Selecione um motivo padrão(Opcional)</MenuItem>
                <MenuItem value="M01">Isenção Artigo 12.º do CIVA(Saúde e Ensino)</MenuItem>
                <MenuItem value="M02">Isenção Artigo 13.º do CIVA(Bens Alimentar)</MenuItem>
                <MenuItem value="M03">Isenção Artigo 14.º do CIVA(Exportações)</MenuItem>
                <MenuItem value="M04">Isenção Artigo 15.º do CIVA(Transportes)</MenuItem>
                <MenuItem value="M10">Isenção Regime de Exclusão</MenuItem>
                <MenuItem value="M11">Isenção Regime Simplificado</MenuItem>
              </Select>
            </FormControl>*/}

            <Grid container sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ ml: 3 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Retenção na Fonte (IRT)
                  </Typography>
                  <RadioGroup
                    row
                    value={form.aplicarIrt ? "aplicavel" : "nao_aplicavel"}
                    onChange={(e) =>
                      setForm({ ...form, aplicarIrt: e.target.value === "aplicavel" })
                    }
                  >
                    <FormControlLabel value="aplicavel" control={<Radio />} label="Aplicável(6.5%)" />
                    <FormControlLabel value="nao_aplicavel" control={<Radio />} label="Não aplicável" />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box sx={{ mr: 10 }}>
                <FormControl>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                    Imposto Industrial
                  </Typography>
                  <RadioGroup
                    row
                    value={form.aplicarImpostoSelo ? "recibo" : "isento"}
                    onChange={(e) =>
                      setForm({ ...form, aplicarImpostoSelo: e.target.value === "recibo" })
                    }
                  >
                    <FormControlLabel value="recibo" control={<Radio />} label="Cobrar no Recibo(1%)" />
                    <FormControlLabel value="isento" control={<Radio />} label="Isento" />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </div>
  );
});

export default ConfiguracoesFiscais;
