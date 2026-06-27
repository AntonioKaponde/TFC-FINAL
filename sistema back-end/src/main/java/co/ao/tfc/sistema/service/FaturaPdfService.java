package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.LinhaFatura;
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

@Service
public class FaturaPdfService {

    public byte[] gerarFaturaPdf(Fatura fatura) throws DocumentException {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font fontSubtitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 10);
        Font fontNormalBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font fontSmall = FontFactory.getFont(FontFactory.HELVETICA, 8);

        Empresa empresa = fatura.getEmpresa();
        Cliente cliente = fatura.getCliente();

        // 1. Cabeçalho (Empresa vs Cliente)
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingBefore(10);
        headerTable.setSpacingAfter(20);
        
        PdfPCell empresaCell = new PdfPCell();
        empresaCell.setBorder(PdfPCell.NO_BORDER);
        empresaCell.addElement(new Paragraph(empresa.getNome(), fontSubtitle));
        empresaCell.addElement(new Paragraph("NIF: " + empresa.getNif(), fontNormal));
        empresaCell.addElement(new Paragraph(empresa.getEndereco() != null ? empresa.getEndereco() : "Angola", fontNormal));
        if (empresa.getTelefone() != null) {
            empresaCell.addElement(new Paragraph("Tel: " + empresa.getTelefone(), fontNormal));
        }
        headerTable.addCell(empresaCell);

        PdfPCell clienteCell = new PdfPCell();
        clienteCell.setBorder(PdfPCell.NO_BORDER);
        clienteCell.addElement(new Paragraph("Exmo.(s) Sr.(s)", fontNormal));
        clienteCell.addElement(new Paragraph(cliente.getNome(), fontSubtitle));
        clienteCell.addElement(new Paragraph("NIF: " + cliente.getNif(), fontNormal));
        if (cliente.getTelefone() != null && !cliente.getTelefone().isEmpty()) {
            clienteCell.addElement(new Paragraph("Tel: " + cliente.getTelefone(), fontNormal));
        }
        headerTable.addCell(clienteCell);

        document.add(headerTable);

        // 2. Título do Documento e Detalhes
        Paragraph title = new Paragraph("FACTURA", fontTitle);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        PdfPTable detailsTable = new PdfPTable(3);
        detailsTable.setWidthPercentage(100);
        detailsTable.setSpacingBefore(10);
        detailsTable.setSpacingAfter(20);

        addCellWithBorder(detailsTable, "Factura N.º\n" + fatura.getNumero(), fontNormal);
        addCellWithBorder(detailsTable, "Data de Emissão\n" + fatura.getDataEmissao().format(formatter), fontNormal);
        addCellWithBorder(detailsTable, "Data de Vencimento\n" + fatura.getDataVencimento().format(formatter), fontNormal);

        document.add(detailsTable);

        // 3. Tabela de Itens
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3.5f, 1.0f, 1.5f, 1.0f, 1.5f, 1.5f});
        table.setSpacingAfter(20);

        addTableHeader(table, fontNormalBold, "Descrição");
        addTableHeader(table, fontNormalBold, "Qtd");
        addTableHeader(table, fontNormalBold, "P. Unitário");
        addTableHeader(table, fontNormalBold, "Tx. IVA");
        addTableHeader(table, fontNormalBold, "IVA");
        addTableHeader(table, fontNormalBold, "Total (Kz)");

        for (LinhaFatura linha : fatura.getLinhas()) {
            addTableCell(table, fontNormal, linha.getArtigo().getNome());
            addTableCell(table, fontNormal, String.valueOf(linha.getQuantidade()));
            addTableCell(table, fontNormal, String.format("%,.2f", linha.getPrecoUnitario()));
            addTableCell(table, fontNormal, String.format("%,.0f%%", linha.getTaxaIva()));
            
            // Calculo do IVA da linha
            java.math.BigDecimal totalIvaLinha = linha.getPrecoUnitario()
                    .multiply(java.math.BigDecimal.valueOf(linha.getQuantidade()))
                    .multiply(linha.getTaxaIva())
                    .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                    
            addTableCell(table, fontNormal, String.format("%,.2f", totalIvaLinha));
            addTableCell(table, fontNormal, String.format("%,.2f", linha.getTotalLinha()));
        }

        document.add(table);

        // 4. Totais Financeiros
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(50);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setSpacingAfter(30);

        addTotalsCell(totalsTable, fontNormalBold, "Subtotal:");
        addTotalsCell(totalsTable, fontNormal, String.format("%,.2f Kz", fatura.getSubtotal()));
        
        addTotalsCell(totalsTable, fontNormalBold, "Total IVA:");
        addTotalsCell(totalsTable, fontNormal, String.format("%,.2f Kz", fatura.getTotalIva()));
        
        addTotalsCell(totalsTable, fontSubtitle, "Total a Pagar:");
        addTotalsCell(totalsTable, fontSubtitle, String.format("%,.2f Kz", fatura.getTotal()));

        document.add(totalsTable);

        // 5. Rodapé (Regras AGT)
        Paragraph motivo = new Paragraph("Os bens/serviços foram colocados à disposição na data de emissão deste documento.", fontSmall);
        motivo.setAlignment(Element.ALIGN_CENTER);
        document.add(motivo);

        Paragraph softwareInfo = new Paragraph("Processado por computador - Kamba Gestão (Software validado nº 00/AGT/2026)", fontSmall);
        softwareInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(softwareInfo);

        document.close();

        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, Font font, String title) {
        PdfPCell cell = new PdfPCell(new Phrase(title, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, Font font, String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCellWithBorder(PdfPTable table, String content, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addTotalsCell(PdfPTable table, Font font, String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(4);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell);
    }
}
