package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

/**
 * Gera o Relatório de Impostos em PDF com dados reais da empresa,
 * conforme o Código do IVA (CIVA) de Angola.
 */
@Service
@RequiredArgsConstructor
public class RelatorioImpostosPdfService {

    private static final Color COR_VERDE      = new Color(11, 110, 79);
    private static final Color COR_CINZA_BG   = new Color(248, 249, 250);
    private static final Color COR_CINZA_TEXT = new Color(100, 116, 139);
    private static final Color COR_VERMELHO   = new Color(220, 38, 38);
    private static final Color COR_VERDE_CLARO = new Color(34, 197, 94);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final FaturaRepository faturaRepository;
    private final ArtigoRepository artigoRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;

    public byte[] gerarRelatorioImpostosPdf(Empresa empresa, int ano) throws DocumentException {
        Document doc = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font fTitulo    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, COR_VERDE);
        Font fSubTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COR_VERDE);
        Font fNormal    = FontFactory.getFont(FontFactory.HELVETICA, 9);
        Font fBold      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        Font fSmall     = FontFactory.getFont(FontFactory.HELVETICA, 8, COR_CINZA_TEXT);
        Font fHeader    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font fTableBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);

        ConfiguracaoFiscal config = configuracaoFiscalRepository
                .findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());

        // ─── Cabeçalho: Título e Dados do Contribuinte ─────────────────────────
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setSpacingBefore(10);
        header.setSpacingAfter(20);
        header.setWidths(new float[]{1f, 1f});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(PdfPCell.NO_BORDER);
        Paragraph titPar = new Paragraph("RELATÓRIO DE LIQUIDAÇÃO DE IVA", fTitulo);
        leftCell.addElement(titPar);
        leftCell.addElement(new Paragraph("Processado por: Kamba Gestão", fSmall));
        header.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(PdfPCell.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph dContribuinte = new Paragraph("DADOS DO CONTRIBUINTE", fBold);
        dContribuinte.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(dContribuinte);
        
        Paragraph nomeEmp = new Paragraph(empresa.getNome(), fNormal);
        nomeEmp.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(nomeEmp);

        if (empresa.getEndereco() != null) {
            Paragraph endEmp = new Paragraph(empresa.getEndereco(), fNormal);
            endEmp.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(endEmp);
        }
        
        Paragraph nifEmp = new Paragraph("NIF: " + empresa.getNif(), fNormal);
        nifEmp.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(nifEmp);

        header.addCell(rightCell);
        doc.add(header);

        // ─── TIPO DE DECLARAÇÃO ────────────────────────────────────────────────
        PdfPTable declTable = new PdfPTable(5);
        declTable.setWidthPercentage(100);
        declTable.setSpacingAfter(20);
        declTable.setWidths(new float[]{1.5f, 1f, 1f, 1.5f, 1.5f});

        addHeaderCell(declTable, "TIPO DE DECLARAÇÃO", fHeader);
        addHeaderCell(declTable, "ANO", fHeader);
        addHeaderCell(declTable, "PERÍODO", fHeader);
        addHeaderCell(declTable, "Nº DECLARAÇÃO", fHeader);
        addHeaderCell(declTable, "ORIGEM DA DECLARAÇÃO", fHeader);

        addCell(declTable, "ANUAL (Resumo)", fNormal, Element.ALIGN_CENTER, COR_CINZA_BG);
        addCell(declTable, String.valueOf(ano), fNormal, Element.ALIGN_CENTER, COR_CINZA_BG);
        addCell(declTable, "ANUAL", fNormal, Element.ALIGN_CENTER, COR_CINZA_BG);
        addCell(declTable, "AUTO-GERADO-" + ano, fNormal, Element.ALIGN_CENTER, COR_CINZA_BG);
        addCell(declTable, "VOLUNTÁRIA", fNormal, Element.ALIGN_CENTER, COR_CINZA_BG);

        doc.add(declTable);

        // ─── VALORES APURADOS DE IVA ───────────────────────────────────────────
        LocalDate inicio = LocalDate.of(ano, 1, 1);
        LocalDate fim    = LocalDate.of(ano, 12, 31);

        BigDecimal ivaAPagar = faturaRepository.somarIvaPorPeriodo(empresa, inicio, fim);
        if (ivaAPagar == null) ivaAPagar = BigDecimal.ZERO;

        BigDecimal ivaARecuperar = BigDecimal.ZERO;
        boolean regimeGeral = config.getRegimeIva() == null || config.getRegimeIva() == RegimeIva.GERAL;
        if (regimeGeral) {
            ivaARecuperar = artigoRepository.calcularIvaARecuperarPorEmpresa(empresa);
            if (ivaARecuperar == null) ivaARecuperar = BigDecimal.ZERO;
        }

        BigDecimal ivaLiquido = ivaAPagar.subtract(ivaARecuperar);
        BigDecimal impostoAPagarEstado = ivaLiquido.compareTo(BigDecimal.ZERO) > 0 ? ivaLiquido : BigDecimal.ZERO;
        BigDecimal impostoARecuperarExcesso = ivaLiquido.compareTo(BigDecimal.ZERO) < 0 ? ivaLiquido.abs() : BigDecimal.ZERO;

        PdfPTable ivaTable = new PdfPTable(3);
        ivaTable.setWidthPercentage(100);
        ivaTable.setSpacingAfter(20);
        ivaTable.setWidths(new float[]{0.5f, 4f, 1.5f});

        // Header for IVA Table
        PdfPCell ivaHeaderCell = new PdfPCell(new Phrase("VALORES APURADOS DE IVA", fHeader));
        ivaHeaderCell.setColspan(3);
        ivaHeaderCell.setBackgroundColor(COR_VERDE);
        ivaHeaderCell.setPadding(6);
        ivaHeaderCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        ivaTable.addCell(ivaHeaderCell);

        addSectionTitle(ivaTable, "A", "IVA - Imposto sobre o Valor Acrescentado", "Kwanzas", fTableBold);
        
        addRow(ivaTable, "A.1.0", "Imposto liquidado nas vendas (Art. 22.º)", formatKz(ivaAPagar), fNormal);
        addRow(ivaTable, "A.2", "Excesso a reportar dos períodos anteriores", "0,00", fNormal);
        addRow(ivaTable, "A.3", "IVA Dedutível nas compras (Art. 19.º)", formatKz(ivaARecuperar), fNormal);
        
        // Imposto Apurado Total
        PdfPCell apuradoLetra = new PdfPCell(new Phrase("A.5", fTableBold));
        apuradoLetra.setPadding(6);
        apuradoLetra.setBackgroundColor(COR_CINZA_BG);
        ivaTable.addCell(apuradoLetra);

        PdfPCell apuradoDesc = new PdfPCell(new Phrase("Imposto Apurado", fTableBold));
        apuradoDesc.setPadding(6);
        apuradoDesc.setBackgroundColor(COR_CINZA_BG);
        ivaTable.addCell(apuradoDesc);
        
        PdfPTable subApurado = new PdfPTable(2);
        subApurado.setWidthPercentage(100);
        subApurado.setWidths(new float[]{1f, 1f});
        
        PdfPCell c1 = new PdfPCell(new Phrase("Imposto a Pagar ao Estado", fNormal));
        c1.setBorder(PdfPCell.NO_BORDER);
        c1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        subApurado.addCell(c1);
        PdfPCell c2 = new PdfPCell(new Phrase(formatKz(impostoAPagarEstado), fNormal));
        c2.setBorder(PdfPCell.NO_BORDER);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        subApurado.addCell(c2);
        
        PdfPCell c3 = new PdfPCell(new Phrase("Imposto a Recuperar", fNormal));
        c3.setBorder(PdfPCell.NO_BORDER);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        subApurado.addCell(c3);
        PdfPCell c4 = new PdfPCell(new Phrase(formatKz(impostoARecuperarExcesso), fNormal));
        c4.setBorder(PdfPCell.NO_BORDER);
        c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
        subApurado.addCell(c4);

        PdfPCell apuradoVal = new PdfPCell(subApurado);
        apuradoVal.setPadding(2);
        apuradoVal.setBackgroundColor(COR_CINZA_BG);
        ivaTable.addCell(apuradoVal);

        doc.add(ivaTable);

        // ─── Tabela Opcional: Detalhe Mensal ──────────────────────────────────
        PdfPTable mensal = new PdfPTable(4);
        mensal.setWidthPercentage(100);
        mensal.setSpacingAfter(20);
        mensal.setWidths(new float[]{1.5f, 2f, 2f, 2f});

        PdfPCell mHeaderCell = new PdfPCell(new Phrase("B | DETALHE MENSAL DE FACTURAÇÃO", fHeader));
        mHeaderCell.setColspan(4);
        mHeaderCell.setBackgroundColor(COR_VERDE);
        mHeaderCell.setPadding(6);
        mHeaderCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        mensal.addCell(mHeaderCell);

        addHeaderCell(mensal, "MÊS", fTableBold, COR_CINZA_BG, Color.BLACK);
        addHeaderCell(mensal, "FACTURAÇÃO GLOBAL", fTableBold, COR_CINZA_BG, Color.BLACK);
        addHeaderCell(mensal, "IVA LIQUIDADO", fTableBold, COR_CINZA_BG, Color.BLACK);
        addHeaderCell(mensal, "IVA A ENTREGAR", fTableBold, COR_CINZA_BG, Color.BLACK);

        List<Object[]> dadosMensais = faturaRepository.resumoMensalPorAno(empresa, ano);
        String[] meses = {"", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};
        
        for (Object[] row : dadosMensais) {
            int mes = (Integer) row[0];
            BigDecimal lucroMes = (BigDecimal) row[1];
            BigDecimal ivaMes   = (BigDecimal) row[2];
            BigDecimal liquidoMes = ivaMes.max(BigDecimal.ZERO);

            addCell(mensal, meses[mes] + "/" + ano, fNormal, Element.ALIGN_CENTER, Color.WHITE);
            addCell(mensal, formatKz(lucroMes), fNormal, Element.ALIGN_RIGHT, Color.WHITE);
            addCell(mensal, formatKz(ivaMes), fNormal, Element.ALIGN_RIGHT, Color.WHITE);
            addCell(mensal, formatKz(liquidoMes), fNormal, Element.ALIGN_RIGHT, Color.WHITE);
        }
        
        if (dadosMensais.isEmpty()) {
            PdfPCell semDados = new PdfPCell(new Phrase("Sem registos de facturação.", fSmall));
            semDados.setColspan(4);
            semDados.setPadding(10);
            semDados.setHorizontalAlignment(Element.ALIGN_CENTER);
            mensal.addCell(semDados);
        }
        doc.add(mensal);

        // ─── Nota legal ───────────────────────────────────────────────────────────
        Paragraph nota2 = new Paragraph(
            "IVA calculado conforme Código do IVA (CIVA) — Lei n.º 7/19 de 24 de Abril, República de Angola.\nEste documento é gerado automaticamente pelo Kamba Gestão e baseia-se nos dados inseridos no sistema.", fSmall);
        nota2.setAlignment(Element.ALIGN_CENTER);
        nota2.setSpacingBefore(10);
        doc.add(nota2);

        doc.close();
        return out.toByteArray();
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        addHeaderCell(table, text, font, COR_VERDE, Color.WHITE);
    }
    
    private void addHeaderCell(PdfPTable table, String text, Font font, Color bgColor, Color textColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(new Color(200, 200, 200));
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, int alignment, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(new Color(200, 200, 200));
        table.addCell(cell);
    }
    
    private void addSectionTitle(PdfPTable table, String num, String title, String col3, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(num, font));
        c1.setBackgroundColor(COR_CINZA_BG);
        c1.setPadding(6);
        table.addCell(c1);
        
        PdfPCell c2 = new PdfPCell(new Phrase(title, font));
        c2.setBackgroundColor(COR_CINZA_BG);
        c2.setPadding(6);
        table.addCell(c2);
        
        PdfPCell c3 = new PdfPCell(new Phrase(col3, font));
        c3.setBackgroundColor(COR_CINZA_BG);
        c3.setPadding(6);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c3);
    }
    
    private void addRow(PdfPTable table, String code, String label, String value, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(code, font));
        c1.setPadding(5);
        c1.setBorderColor(new Color(200, 200, 200));
        table.addCell(c1);
        
        PdfPCell c2 = new PdfPCell(new Phrase(label, font));
        c2.setPadding(5);
        c2.setBorderColor(new Color(200, 200, 200));
        table.addCell(c2);
        
        PdfPCell c3 = new PdfPCell(new Phrase(value, font));
        c3.setPadding(5);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c3.setBorderColor(new Color(200, 200, 200));
        table.addCell(c3);
    }

    private String formatKz(BigDecimal valor) {
        if (valor == null) return "0,00";
        return String.format("%,.2f", valor);
    }
}
