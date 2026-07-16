package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.LinhaFatura;
import co.ao.tfc.sistema.model.enums.TipoDocumento;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Serviço de geração de PDF de facturas conforme o
 * Regime Jurídico das Facturas e Documentos Equivalentes (Decreto nº 34/09 — Angola).
 */
@Service
public class FaturaPdfService {

    private static final Color COR_VERDE = new Color(11, 110, 79);
    private static final Color COR_CINZA_CLARO = new Color(248, 249, 250);
    private static final Color COR_CINZA = new Color(100, 116, 139);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] gerarFaturaPdf(Fatura fatura) throws DocumentException {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font fontTitle  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, COR_VERDE);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        Font fontNormal  = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font fontBold   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font fontSmall  = FontFactory.getFont(FontFactory.HELVETICA, 8, COR_CINZA);
        Font fontSmallBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8);
        Font fontTotal  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COR_VERDE);

        Empresa empresa = fatura.getEmpresa();
        Cliente cliente = fatura.getCliente();

        // ─── Linha verde no topo ──────────────────────────────────────────────
        PdfPTable topoBar = new PdfPTable(1);
        topoBar.setWidthPercentage(100);
        PdfPCell barCell = new PdfPCell(new Phrase(" "));
        barCell.setBackgroundColor(COR_VERDE);
        barCell.setBorder(PdfPCell.NO_BORDER);
        barCell.setFixedHeight(6f);
        topoBar.addCell(barCell);
        document.add(topoBar);

        // ─── Cabeçalho: Empresa | Título do Documento ─────────────────────────
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingBefore(12);
        headerTable.setSpacingAfter(16);
        headerTable.setWidths(new float[]{1.4f, 1f});

        // Coluna esquerda: dados da empresa
        PdfPCell empresaCell = new PdfPCell();
        empresaCell.setBorder(PdfPCell.NO_BORDER);
        empresaCell.addElement(new Paragraph(empresa.getNome(), fontSubtitle));
        empresaCell.addElement(new Paragraph("NIF: " + empresa.getNif(), fontNormal));
        if (empresa.getEndereco() != null) {
            empresaCell.addElement(new Paragraph(empresa.getEndereco(), fontNormal));
        }
        if (empresa.getTelefone() != null) {
            empresaCell.addElement(new Paragraph("Tel: " + empresa.getTelefone(), fontNormal));
        }
        if (empresa.getEmail() != null) {
            empresaCell.addElement(new Paragraph(empresa.getEmail(), fontNormal));
        }
        headerTable.addCell(empresaCell);

        // Coluna direita: tipo e número do documento
        PdfPCell tituloCell = new PdfPCell();
        tituloCell.setBorder(PdfPCell.NO_BORDER);
        tituloCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        String nomeTipoDoc = labelTipoDocumento(fatura.getTipoDocumento());
        Paragraph tituloPar = new Paragraph(nomeTipoDoc, fontTitle);
        tituloPar.setAlignment(Element.ALIGN_RIGHT);
        tituloCell.addElement(tituloPar);

        Paragraph numeroPar = new Paragraph("N.º " + fatura.getNumero(), fontSubtitle);
        numeroPar.setAlignment(Element.ALIGN_RIGHT);
        tituloCell.addElement(numeroPar);
        headerTable.addCell(tituloCell);
        document.add(headerTable);

        // ─── Linha separadora ─────────────────────────────────────────────────
        addSeparador(document);

        // ─── Dados da factura + dados do cliente ──────────────────────────────
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10);
        infoTable.setSpacingAfter(16);
        infoTable.setWidths(new float[]{1f, 1f});

        // Dados do documento
        PdfPCell docCell = new PdfPCell();
        docCell.setBorder(PdfPCell.NO_BORDER);
        docCell.addElement(new Paragraph("DADOS DO DOCUMENTO", fontSmallBold));
        docCell.addElement(new Paragraph("Data de Emissão: " + fatura.getDataEmissao().format(FORMATTER), fontNormal));
        docCell.addElement(new Paragraph("Data de Vencimento: " + fatura.getDataVencimento().format(FORMATTER), fontNormal));
        docCell.addElement(new Paragraph("Tipo: " + nomeTipoDoc, fontNormal));
        docCell.addElement(new Paragraph("Estado: " + labelEstado(fatura), fontNormal));

        // Método de pagamento
        String pagamento = labelPagamento(fatura);
        docCell.addElement(new Paragraph("Pagamento: " + pagamento, fontBold));
        infoTable.addCell(docCell);

        // Dados do cliente
        PdfPCell clienteCell = new PdfPCell();
        clienteCell.setBorder(PdfPCell.NO_BORDER);
        clienteCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        clienteCell.addElement(new Paragraph("FATURADO A", fontSmallBold));
        clienteCell.addElement(new Paragraph(cliente.getNome(), fontSubtitle));
        clienteCell.addElement(new Paragraph("NIF: " + cliente.getNif(), fontNormal));
        if (cliente.getTelefone() != null && !cliente.getTelefone().isEmpty()) {
            clienteCell.addElement(new Paragraph("Tel: " + cliente.getTelefone(), fontNormal));
        }
        if (cliente.getEmail() != null) {
            clienteCell.addElement(new Paragraph(cliente.getEmail(), fontNormal));
        }
        infoTable.addCell(clienteCell);
        document.add(infoTable);

        // ─── Tabela de artigos ────────────────────────────────────────────────
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3.5f, 0.8f, 1.6f, 1.0f, 1.4f, 1.6f});
        table.setSpacingAfter(20);

        addTableHeader(table, fontBold, "Descrição");
        addTableHeader(table, fontBold, "Qtd");
        addTableHeader(table, fontBold, "P. Unit. (Kz)");
        addTableHeader(table, fontBold, "IVA %");
        addTableHeader(table, fontBold, "IVA (Kz)");
        addTableHeader(table, fontBold, "Total (Kz)");

        for (LinhaFatura linha : fatura.getLinhas()) {
            java.math.BigDecimal totalLinhaSemIva = linha.getPrecoUnitario()
                    .multiply(java.math.BigDecimal.valueOf(linha.getQuantidade()));
            java.math.BigDecimal ivaLinha = totalLinhaSemIva
                    .multiply(linha.getTaxaIva())
                    .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

            addTableCell(table, fontNormal, linha.getArtigo().getNome(), Element.ALIGN_LEFT);
            addTableCell(table, fontNormal, String.valueOf(linha.getQuantidade()), Element.ALIGN_CENTER);
            addTableCell(table, fontNormal, String.format("%,.2f", linha.getPrecoUnitario()), Element.ALIGN_RIGHT);
            addTableCell(table, fontNormal, String.format("%,.0f%%", linha.getTaxaIva()), Element.ALIGN_CENTER);
            addTableCell(table, fontNormal, String.format("%,.2f", ivaLinha), Element.ALIGN_RIGHT);
            addTableCell(table, fontNormal, String.format("%,.2f", linha.getTotalLinha()), Element.ALIGN_RIGHT);
        }
        document.add(table);

        // ─── Totais ───────────────────────────────────────────────────────────
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(42);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setSpacingAfter(25);
        totalsTable.setWidths(new float[]{1.2f, 1f});

        addTotalRow(totalsTable, fontNormal, fontNormal, "Subtotal (s/IVA):", String.format("%,.2f Kz", fatura.getSubtotal()), false);
        addTotalRow(totalsTable, fontNormal, fontNormal, "Total IVA:", String.format("%,.2f Kz", fatura.getTotalIva()), false);

        // Linha de total destacada
        PdfPCell labelTotalCell = new PdfPCell(new Phrase("TOTAL A PAGAR:", fontTotal));
        labelTotalCell.setBorder(PdfPCell.TOP);
        labelTotalCell.setPadding(6);
        labelTotalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelTotalCell.setBorderColor(COR_VERDE);
        totalsTable.addCell(labelTotalCell);

        PdfPCell valorTotalCell = new PdfPCell(new Phrase(String.format("%,.2f Kz", fatura.getTotal()), fontTotal));
        valorTotalCell.setBorder(PdfPCell.TOP);
        valorTotalCell.setPadding(6);
        valorTotalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valorTotalCell.setBorderColor(COR_VERDE);
        totalsTable.addCell(valorTotalCell);
        document.add(totalsTable);

        // ─── Rodapé legal obrigatório (AGT Angola) ────────────────────────────
        addSeparador(document);

        Paragraph rodape1 = new Paragraph(
            "Os bens/serviços foram colocados à disposição na data de emissão deste documento.", fontSmall);
        rodape1.setAlignment(Element.ALIGN_CENTER);
        rodape1.setSpacingBefore(6);
        document.add(rodape1);

        Paragraph rodape2 = new Paragraph(
            "Processado por computador — Kamba Gestão (Software certificado pela AGT, n.º 00/AGT/2026)", fontSmall);
        rodape2.setAlignment(Element.ALIGN_CENTER);
        document.add(rodape2);

        // ─── Barra verde no rodapé ────────────────────────────────────────────
        PdfPTable fundo = new PdfPTable(1);
        fundo.setWidthPercentage(100);
        fundo.setSpacingBefore(10);
        PdfPCell fundoCell = new PdfPCell(new Phrase(" "));
        fundoCell.setBackgroundColor(COR_VERDE);
        fundoCell.setBorder(PdfPCell.NO_BORDER);
        fundoCell.setFixedHeight(6f);
        fundo.addCell(fundoCell);
        document.add(fundo);

        document.close();
        return out.toByteArray();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Rótulo oficial do tipo de documento conforme Decreto 34/09 Angola.
     */
    private String labelTipoDocumento(TipoDocumento tipo) {
        if (tipo == null) return "FACTURA";
        return switch (tipo) {
            case FATURA -> "FACTURA";
            case FATURA_RECIBO -> "FACTURA-RECIBO";
            case FATURA_SIMPLIFICADA -> "FACTURA SIMPLIFICADA";
        };
    }

    private String labelEstado(Fatura fatura) {
        if (fatura.getEstado() == null) return "-";
        return switch (fatura.getEstado()) {
            case PAGO -> "Pago";
            case PENDENTE -> "Pendente";
            case VENCIDO -> "Vencido";
        };
    }

    private String labelPagamento(Fatura fatura) {
        if (!fatura.isPagoPronto()) {
            return "A prazo (crédito)";
        }
        if (fatura.getMetodoPagamento() == null) {
            return "Pronto (não especificado)";
        }
        return switch (fatura.getMetodoPagamento()) {
            case DINHEIRO -> "Dinheiro (Numerário)";
            case TPA -> "TPA (Cartão)";
            case MULTICAIXA -> "Multicaixa Express";
            case TRANSFERENCIA -> "Transferência Bancária";
            case CHEQUE -> "Cheque";
        };
    }

    private void addSeparador(Document document) throws DocumentException {
        PdfPTable sep = new PdfPTable(1);
        sep.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell(new Phrase(" "));
        cell.setBorder(PdfPCell.BOTTOM);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setFixedHeight(2f);
        sep.addCell(cell);
        document.add(sep);
    }

    private void addTableHeader(PdfPTable table, Font font, String title) {
        PdfPCell cell = new PdfPCell(new Phrase(title, font));
        cell.setBackgroundColor(COR_VERDE);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        Font white = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        cell.setPhrase(new Phrase(title, white));
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, Font font, String content, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, Font labelFont, Font valueFont,
                              String label, String value, boolean highlight) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setPadding(4);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setPadding(4);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }
}
