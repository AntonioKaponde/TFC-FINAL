import { Box, Card, Divider, Grid, List, ListItem, Stack, Typography } from '@mui/material'
import React from 'react'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { formatKzSemPrefixo } from '../utils/formatters';

export default function CardVenda({ subtotal, totalIva, total, dataEntrega }) {
  return (
    <div>
      <Grid container spacing={2} sx={{ width: "100%" }}>
        <Stack direction={{ xs: "column", lg: "row" }} sx={{ display: "flex", gap: 2, width: "100%" }}>
          <Grid sx={{ display: "flex", gap: 2, flexDirection: "column", flex: 1, minWidth: 0 }}>
            <Typography>Observações (Vísiveis na Fatura)</Typography>
            <Card sx={{ p: "10px 20px", minHeight: "5rem", bgcolor: "#F7FAFC" }}>
              <Typography>
                Os bens/serviços foram entregues ao adquirente em {dataEntrega}.
              </Typography>
            </Card>
            <Card sx={{ bgcolor: "rgb(158, 248, 170)", p: "10px 20px", minHeight: "5rem", display: "flex", gap: 1 }}>
              <CheckBoxOutlinedIcon />
              <Typography color='#fff'>
                Este documento esta conforme os critérios estabelecidos pela AGT.
                Sistema não validado.
              </Typography>
            </Card>
          </Grid>
          <Grid>
            <Card sx={{ mt: { xs: 2, lg: 5 }, width: { xs: "100%", lg: "23rem" }, bgcolor: "#F7FAFC" }}>
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
                <List sx={{ display: "flex", justifyContent: "space-between" }}>
                  <ListItem sx={{ fontWeight: "bold" }}>Total a Pagar</ListItem>
                  <ListItem sx={{ fontWeight: "bold", justifyContent: "flex-end" }}>{formatKzSemPrefixo(total)} (Kz)</ListItem>
                </List>
              </Box>
            </Card>
          </Grid>
        </Stack>
      </Grid>
    </div>
  )
}
