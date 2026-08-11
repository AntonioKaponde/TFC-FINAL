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
       <Grid container spacing={2} sx={{ width: "100%" }}>
              <Card sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
                <Box>
                  <Typography variant="subtitle" sx={{ fontWeight: 800, color: '#111' }}>
                    Séries de Documentos
                  </Typography>
                </Box>
                <Divider />
                <Grid sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
                  <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
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
                  <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Série Padrão
                    </Typography>
                    <input
                      type="text"
                      placeholder="A" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'block' }}>
                      Prefixo de Faturas(FT)<span style={{ color: "red" }}>*</span>
                    </Typography>
                    <input
                      type="text"
                      placeholder="FT" disabled
                      style={{ height: "50px", padding: 10, fontSize: 15,marginTop:5 }}
                    />
                  </FormControl>
                  <FormControl sx={{ width: { xs: "100%", md: "50%" }, p: { xs: 1.5, md: 3 } }}>
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
