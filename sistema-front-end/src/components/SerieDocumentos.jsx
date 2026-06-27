import React, { forwardRef, useImperativeHandle } from 'react'
import {
  Box,
  Card,
  Divider,
  FormControl,
  Grid,
  Typography,
} from "@mui/material";

const SerieDocumentos = forwardRef((props, ref) => {

  useImperativeHandle(ref, () => ({
    save: async () => {
      // Implementar no futuro quando houver API para Série de Documentos
    }
  }));

  return (
    <div>
       <Grid container spacing={2}>
              <Card sx={{ p: 4, width: "60em", ml: 10 }}>
                <Box>
                  <Typography variant="subtitle" sx={{ fontWeight: 800, color: '#111' }}>
                    Séries de Documentos
                  </Typography>
                </Box>
                <Divider />
                <Grid sx={{ alignItems: "center" }}>
                  <FormControl sx={{ width: "28rem", p: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                     Ano Fiscal Activo
                      <span style={{ color: "red" }}>*</span>
                    </Typography>
                   <input
                      type="text"
                      placeholder="2026" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: "28rem", p: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Série Padrão
                    </Typography>
                    <input
                      type="text"
                      placeholder="A" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: "28rem", p: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Prefixo de Faturas(FT)<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <input
                      type="text"
                      placeholder="FT" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: "28rem", p: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Prefixo de Fatura-Recebo(FR)<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <input
                      placeholder="FR" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                </Grid>
              </Card>
            </Grid>
    </div>
  )
});

export default SerieDocumentos;
