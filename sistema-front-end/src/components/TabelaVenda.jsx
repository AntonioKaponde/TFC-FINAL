import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Button, FormControl, IconButton, MenuItem, Select } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { formatKzSemPrefixo } from "../utils/formatters";

export default function TabelaVenda({ linhas, artigos, onChange, onAddLinha, onRemoveLinha }) {
  const atualizarLinha = (index, campo, valor) => {
    const novas = linhas.map((linha, i) =>
      i === index ? { ...linha, [campo]: valor } : linha,
    );
    onChange(novas);
  };

  const obterArtigo = (artigoId) => artigos.find((a) => a.id === Number(artigoId));

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ fontWeight: "600", bgcolor: "#f1f5f9", fontSize: "0.75rem" }}>
              {["Artigo/Descrição", "Qtd", "Preço Unit.(Kz)", "Taxa (IVA)", "Total Líquido (Kz)", ""].map(
                (head, index) => (
                  <TableCell
                    key={head || "acoes"}
                    sx={{ fontWeight: "600", fontSize: "0.75rem" }}
                    align={index === 0 ? "left" : "right"}
                  >
                    {head}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.map((linha, index) => {
              const artigo = obterArtigo(linha.artigoId);
              const qty = Number(linha.quantidade) || 0;
              const subtotal = artigo ? Number(artigo.preco) * qty : 0;
              const totalLinha = subtotal + subtotal * (Number(artigo?.taxaIva || 0) / 100);

              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={linha.artigoId || ""}
                        displayEmpty
                        onChange={(e) => atualizarLinha(index, "artigoId", e.target.value)}
                        sx={{ height: "36px", minWidth: "20rem" }}
                      >
                        <MenuItem value="" disabled>Selecione um artigo</MenuItem>
                        {artigos.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.nome} (Stock: {a.stock})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <input
                      type="number"
                      min="1"
                      value={linha.quantidade}
                      onChange={(e) => atualizarLinha(index, "quantidade", e.target.value)}
                      onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                      style={{ width: "70px", height: "30px", outline: "none", textAlign: "right" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {artigo ? formatKzSemPrefixo(artigo.preco) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {artigo ? `${artigo.taxaIva}%` : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {artigo ? formatKzSemPrefixo(totalLinha) : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {linhas.length > 1 && (
                      <IconButton size="small" onClick={() => onRemoveLinha(index)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        startIcon={<AddIcon />}
        onClick={onAddLinha}
        sx={{ mt: 2, textTransform: "none", color: "#0B6E4F" }}
      >
        Adicionar linha
      </Button>
    </Box>
  );
}
