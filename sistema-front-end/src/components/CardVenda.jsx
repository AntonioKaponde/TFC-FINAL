import { Box, Card, Divider, Grid, List, ListItem, Stack, Typography } from '@mui/material'
import React from 'react'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { formatKzSemPrefixo } from '../utils/formatters';

export default function CardVenda({ subtotal, totalIva, total, dataEntrega }) {
  return (
    <div>
      <Grid container spacing={2}>
        <Stack direction={"row"} sx={{ display: "flex", gap: 2 }}>
          <Grid sx={{ display: "flex", gap: 2, flexDirection: "column", width: "55rem" }}>
            <Typography>Observações (Vísiveis na Fatura)</Typography>
            <Card sx={{ p: "10px 20px", height: "5rem", bgcolor: "#F7FAFC" }}>
              <Typography>
                Os bens/serviços foram entregues ao adquirente em {dataEntrega}.
              </Typography>
            </Card>
            <Card sx={{ bgcolor: "rgb(158, 248, 170)", p: "10px 20px", height: "5rem", display: "flex" }}>
              <CheckBoxOutlinedIcon />
              <Typography color='#fff'>
                Este documento esta conforme os critérios estabelecidos pela AGT.
                Sistema não validado.
              </Typography>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ mt: 5, mr: 5, width: "23rem", bgcolor: "#F7FAFC" }}>
              <Stack direction={"row"}>
                <Box>
                  <List>
                    <ListItem>Base Tributável(Líquido)</ListItem>
                    <ListItem>Total Impostos</ListItem>
                    <ListItem>IVA</ListItem>
                  </List>
                </Box>
                <Box>
                  <List>
                    <ListItem sx={{ fontWeight: "bold" }}>{formatKzSemPrefixo(subtotal)} (Kz)</ListItem>
                    <ListItem>{formatKzSemPrefixo(totalIva)} (Kz)</ListItem>
                    <ListItem>{formatKzSemPrefixo(totalIva)} (Kz)</ListItem>
                  </List>
                </Box>
              </Stack>
              <Divider />
              <Box>
                <List sx={{ display: "flex" }}>
                  <ListItem sx={{ fontWeight: "bold" }}>Total a Pagar</ListItem>
                  <ListItem sx={{ fontWeight: "bold", ml: 9 }}>{formatKzSemPrefixo(total)} (Kz)</ListItem>
                </List>
              </Box>
            </Card>
          </Grid>
        </Stack>
      </Grid>
    </div>
  )
}
