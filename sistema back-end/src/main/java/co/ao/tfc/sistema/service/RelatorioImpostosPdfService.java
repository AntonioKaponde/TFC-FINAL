package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
import co.ao.tfc.sistema.repository.MovimentoEstoqueRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gera o Relatório de Liquidação de IVA em PDF profissional,
 * com dados reais das tabelas de faturas e movimentos de estoque.
 * Conforme Código do IVA (CIVA) — Lei n.º 7/19 de 24 de Abril, Angola.
 *
 * Relatório 100% em tabelas — sem UI do frontend.
 */
@Service
@RequiredArgsConstructor
public class RelatorioImpostosPdfService {

    private static final Color COR_VERDE       = new Color(11, 110, 79);
    private static final Color COR_AZUL        = new Color(30, 64, 175);
    private static final Color COR_CINZA_BG    = new Color(248, 249, 250);
    private static final Color COR_CINZA_TEXT  = new Color(100, 116, 139);
    private static final Color COR_LINHA_PAR   = new Color(240, 245, 255);
    private static final Color COR_VERMELHO    = new Color(220, 38, 38);
    private static final Color COR_VERDE_CLARO = new Color(22, 163, 74);
    private static final Color COR_BORDA       = new Color(210, 210, 210);
    private static final Color COR_DOURADO     = new Color(180, 130, 30);
    private static final Color COR_LARANJA     = new Color(245, 158, 11);
    private static final Color COR_BEGE_BG     = new Color(255, 248, 230);

    private static final String[] MESES = {
            "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    };
    private static final String[] MESES_ABR = {
            "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    };
    private static final DateTimeFormatter FMT_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final FaturaRepository faturaRepository;
    private final MovimentoEstoqueRepository movimentoEstoqueRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;

    public byte[] gerarRelatorioImpostosPdf(Empresa empresa, int ano) throws DocumentException {
        Document doc = new Document(PageSize.A4, 40, 40, 50, 60);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(doc, out);

        // ─── Page event para numeração e rodapé ──────────────────────────────────
        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter writer, Document document) {
                PdfContentByte cb = writer.getDirectContent();
                Font fPag = FontFactory.getFont(FontFactory.HELVETICA, 7, COR_CINZA_TEXT);
                String footer = String.format("Relatório de Liquidação de IVA | %d | Página %d",
                        ano, writer.getPageNumber());
                ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                        new Phrase(footer, fPag),
                        (document.left() + document.right()) / 2,
                        document.bottom() - 12, 0);
            }
        });

        doc.open();

        // ─── Fontes ───────────────────────────────────────────────────────────────
        Font fTitulo     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, COR_VERDE);
        Font fSubTitulo  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, COR_VERDE);
        Font fSecao      = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, Color.WHITE);
        Font fNormal     = FontFactory.getFont(FontFactory.HELVETICA, 8);
        Font fNegrito    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8);
        Font fPequeno    = FontFactory.getFont(FontFactory.HELVETICA, 7, COR_CINZA_TEXT);
        Font fDestaque   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERMELHO);
        Font fValorVerde = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERDE_CLARO);
        Font fHeader     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        Font fInfoLabel  = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, COR_CINZA_TEXT);
        Font fInfoVal    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, new Color(30, 30, 30));

        // ─── Configuração Fiscal ──────────────────────────────────────────────────
        ConfiguracaoFiscal config = configuracaoFiscalRepository
                .findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());

        boolean regimeGeral = config.getRegimeIva() == null || config.getRegimeIva() == RegimeIva.GERAL;
        BigDecimal taxaIva = config.getTaxaIva() != null ? config.getTaxaIva() : BigDecimal.valueOf(14);

        // ─── Dados Calculados ──────────────────────────────────────────────────────
        LocalDate inicio = LocalDate.of(ano, 1, 1);
        LocalDate fim    = LocalDate.of(ano, 12, 31);

        BigDecimal totalIvaFaturas  = nvl(faturaRepository.somarIvaPorPeriodo(empresa, inicio, fim));
        BigDecimal baseTributavel   = nvl(faturaRepository.somarSubtotalPorPeriodo(empresa, inicio, fim));
        BigDecimal totalFaturado    = nvl(faturaRepository.somarTotalPorPeriodo(empresa, inicio, fim));
        Long totalDocumentos        = faturaRepository.contarDocumentosPorAno(empresa, ano);
        if (totalDocumentos == null) totalDocumentos = 0L;

        // IVA Dedutível
        BigDecimal ivaDedutivel = BigDecimal.ZERO;
        BigDecimal volumeCompras = BigDecimal.ZERO;
        LocalDateTime inicioLdt = inicio.atStartOfDay();
        LocalDateTime fimLdt = fim.atTime(23, 59, 59);

        if (regimeGeral) {
            ivaDedutivel = nvl(movimentoEstoqueRepository.somarIvaDedutiveisPorPeriodo(empresa, inicioLdt, fimLdt));
        }
        
        volumeCompras = nvl(movimentoEstoqueRepository.somarVolumeComprasPorPeriodo(empresa, inicioLdt, fimLdt));

        BigDecimal ivaLiquido     = totalIvaFaturas.subtract(ivaDedutivel);
        BigDecimal ivaAPagar      = ivaLiquido.compareTo(BigDecimal.ZERO) > 0 ? ivaLiquido : BigDecimal.ZERO;
        BigDecimal ivaARecuperar  = ivaLiquido.compareTo(BigDecimal.ZERO) < 0 ? ivaLiquido.abs() : BigDecimal.ZERO;

        // Dados mensais e diários
        List<Object[]> dadosMensais   = faturaRepository.resumoMensalPorAno(empresa, ano);
        List<Object[]> ivaDedMensal   = movimentoEstoqueRepository.resumoMensalIvaDedutivel(empresa, ano);

        Map<Integer, BigDecimal> mapIvaDed = new HashMap<>();
        for (Object[] row : ivaDedMensal) {
            mapIvaDed.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }

        Map<Integer, List<Object[]>> mapDiario = new HashMap<>();
        for (Object[] row : dadosMensais) {
            int mes = ((Number) row[0]).intValue();
            mapDiario.put(mes, faturaRepository.resumoDiarioPorMes(empresa, ano, mes));
        }

        // Dashboard: método pagamento, tipo documento, estado, top clientes
        List<Object[]> metodosPagto   = faturaRepository.resumoPorMetodoPagamento(empresa, ano);
        List<Object[]> tiposDoc       = faturaRepository.resumoPorTipoDocumento(empresa, ano);
        List<Object[]> estadosFat     = faturaRepository.resumoPorEstado(empresa, ano);
        List<Object[]> topClientes    = faturaRepository.topClientesPorAno(empresa, ano);

        String regimeLabel = config.getRegimeIva() != null ? config.getRegimeIva().name() : "GERAL";

        // ═══════════════════════════════════════════════════════════════════════════
        //  CABEÇALHO — DADOS DA EMPRESA
        // ═══════════════════════════════════════════════════════════════════════════
        PdfPTable cabecalhoEmpresa = new PdfPTable(2);
        cabecalhoEmpresa.setWidthPercentage(100);
        cabecalhoEmpresa.setSpacingAfter(6);
        cabecalhoEmpresa.setWidths(new float[]{1.3f, 1f});

        PdfPCell ceLeft = new PdfPCell();
        ceLeft.setBorder(PdfPCell.NO_BORDER);
        ceLeft.addElement(new Paragraph("RELATÓRIO DE LIQUIDAÇÃO DE IVA", fTitulo));
        ceLeft.addElement(new Paragraph("Ano Fiscal: " + ano, fSubTitulo));
        ceLeft.addElement(new Paragraph("Gerado em: " + LocalDate.now().format(FMT_DATA), fPequeno));
        ceLeft.addElement(new Paragraph("Processado por: Kamba Gestão", fPequeno));
        cabecalhoEmpresa.addCell(ceLeft);

        PdfPCell ceRight = new PdfPCell();
        ceRight.setBorder(PdfPCell.NO_BORDER);
        ceRight.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPTable tblInfoEmp = new PdfPTable(1);
        tblInfoEmp.setWidthPercentage(100);
        addInfoRow(tblInfoEmp, empresa.getNome(), fInfoVal, true, null);
        if (empresa.getNif() != null)
            addInfoRow(tblInfoEmp, "NIF: " + empresa.getNif(), fInfoLabel, false, null);
        if (empresa.getEndereco() != null)
            addInfoRow(tblInfoEmp, "Endereço: " + empresa.getEndereco(), fInfoLabel, false, null);
        if (empresa.getTelefone() != null)
            addInfoRow(tblInfoEmp, "Tel: " + empresa.getTelefone(), fInfoLabel, false, null);
        if (empresa.getEmail() != null)
            addInfoRow(tblInfoEmp, "Email: " + empresa.getEmail(), fInfoLabel, false, null);
        addInfoRow(tblInfoEmp, "Regime IVA: " + regimeLabel + "  |  Taxa: " + fmtPct(taxaIva), fInfoLabel, false, COR_BEGE_BG);

        ceRight.addElement(tblInfoEmp);
        cabecalhoEmpresa.addCell(ceRight);
        doc.add(cabecalhoEmpresa);

        // Linha separadora
        PdfPTable separador = new PdfPTable(1);
        separador.setWidthPercentage(100);
        separador.setSpacingAfter(12);
        PdfPCell sepCell = new PdfPCell();
        sepCell.setFixedHeight(2);
        sepCell.setBackgroundColor(COR_VERDE);
        sepCell.setBorder(PdfPCell.NO_BORDER);
        separador.addCell(sepCell);
        doc.add(separador);

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO A — SUMÁRIO EXECUTIVO ANUAL
        // ═══════════════════════════════════════════════════════════════════════════
        doc.add(secaoTitle("A  |  SUMÁRIO EXECUTIVO ANUAL", fSecao));

        PdfPTable tblResumo = new PdfPTable(2);
        tblResumo.setWidthPercentage(100);
        tblResumo.setSpacingAfter(14);
        tblResumo.setWidths(new float[]{3.2f, 1.5f});

        addLinhaResumo(tblResumo, "Volume de Vendas (Base Tributável)",         fmtKz(baseTributavel),    fNormal, fNegrito, false);
        addLinhaResumo(tblResumo, "Total Faturado de Vendas (Base + IVA)",      fmtKz(totalFaturado),     fNormal, fNegrito, true);
        addLinhaResumo(tblResumo, "Volume de Compras (Custo + IVA Suportado)",  fmtKz(volumeCompras),     fNormal, fNegrito, false);
        addLinhaResumo(tblResumo, "Total de Documentos Emitidos",               fmtLong(totalDocumentos), fNormal, fNegrito, true);
        addLinhaResumo(tblResumo, "IVA Liquidado nas Vendas (Art. 22.º CIVA)",  fmtKz(totalIvaFaturas),   fNormal, fNegrito, false);
        addLinhaResumo(tblResumo, "IVA Dedutível nas Compras (Art. 19.º CIVA)", regimeGeral ? fmtKz(ivaDedutivel) : "N/A — Regime não permite dedução", fNormal, fNegrito, true);

        // Linha destaque IVA a pagar
        Font fLabelVerm = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERMELHO);
        Font fValVerm   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERMELHO);
        PdfPCell c1 = cellResumo("IVA a Entregar ao Estado (IVA Liquidado − IVA Dedutível)", fLabelVerm, COR_CINZA_BG);
        PdfPCell c2 = cellResumo(fmtKz(ivaAPagar), fValVerm, COR_CINZA_BG);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tblResumo.addCell(c1);
        tblResumo.addCell(c2);

        if (ivaARecuperar.compareTo(BigDecimal.ZERO) > 0) {
            Font fLabelVd = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERDE_CLARO);
            Font fValVd   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, COR_VERDE_CLARO);
            PdfPCell c3 = cellResumo("IVA a Recuperar (Crédito Fiscal)", fLabelVd, COR_CINZA_BG);
            PdfPCell c4 = cellResumo(fmtKz(ivaARecuperar), fValVd, COR_CINZA_BG);
            c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
            tblResumo.addCell(c3);
            tblResumo.addCell(c4);
        }
        doc.add(tblResumo);

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO B — DETALHE MENSAL DE FACTURAÇÃO
        // ═══════════════════════════════════════════════════════════════════════════
        doc.add(secaoTitle("B  |  DETALHE MENSAL DE FACTURAÇÃO — " + ano, fSecao));

        PdfPTable tblMensal = new PdfPTable(7);
        tblMensal.setWidthPercentage(100);
        tblMensal.setSpacingAfter(14);
        tblMensal.setWidths(new float[]{1.0f, 0.9f, 1.6f, 1.4f, 1.4f, 1.4f, 1.6f});

        String[] colsMensal = {"MÊS", "Nº DOCS", "BASE TRIBUTÁVEL", "IVA LIQUID.", "IVA DEDUT.", "IVA ENTREG.", "TOTAL FATURADO"};
        for (String col : colsMensal) addCellHeader(tblMensal, col, fHeader, COR_AZUL);

        BigDecimal totalBase = BigDecimal.ZERO, totalIvaLiq = BigDecimal.ZERO;
        BigDecimal totalIvaDed = BigDecimal.ZERO, totalIvaEnt = BigDecimal.ZERO;
        BigDecimal totalGeral = BigDecimal.ZERO;
        long totalDocs = 0L;

        int idxLinha = 0;
        for (Object[] row : dadosMensais) {
            int mes        = ((Number) row[0]).intValue();
            BigDecimal base = nvl((BigDecimal) row[1]);
            BigDecimal iva  = nvl((BigDecimal) row[2]);
            long docs       = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            BigDecimal ivaDedMes = nvl(mapIvaDed.get(mes));
            BigDecimal ivaEntMes = iva.subtract(ivaDedMes).max(BigDecimal.ZERO);
            BigDecimal totalMes  = base.add(iva);

            Color bg = idxLinha % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;

            addCell(tblMensal, MESES_ABR[mes] + "/" + ano, fNegrito, Element.ALIGN_CENTER, bg);
            addCell(tblMensal, String.valueOf(docs), fNormal, Element.ALIGN_CENTER, bg);
            addCell(tblMensal, fmtKz(base), fNormal, Element.ALIGN_RIGHT, bg);
            addCell(tblMensal, fmtKz(iva), fNormal, Element.ALIGN_RIGHT, bg);
            addCell(tblMensal, fmtKz(ivaDedMes), fNormal, Element.ALIGN_RIGHT, bg);
            addCell(tblMensal, fmtKz(ivaEntMes), fNormal, Element.ALIGN_RIGHT, bg);
            addCell(tblMensal, fmtKz(totalMes), fNormal, Element.ALIGN_RIGHT, bg);

            totalBase   = totalBase.add(base);
            totalIvaLiq = totalIvaLiq.add(iva);
            totalIvaDed = totalIvaDed.add(ivaDedMes);
            totalIvaEnt = totalIvaEnt.add(ivaEntMes);
            totalGeral  = totalGeral.add(totalMes);
            totalDocs  += docs;
            idxLinha++;
        }

        // Linha de totais
        if (!dadosMensais.isEmpty()) {
            addCell(tblMensal, "TOTAL", fNegrito, Element.ALIGN_CENTER, COR_CINZA_BG);
            addCell(tblMensal, String.valueOf(totalDocs), fNegrito, Element.ALIGN_CENTER, COR_CINZA_BG);
            addCell(tblMensal, fmtKz(totalBase), fNegrito, Element.ALIGN_RIGHT, COR_CINZA_BG);
            addCell(tblMensal, fmtKz(totalIvaLiq), fNegrito, Element.ALIGN_RIGHT, COR_CINZA_BG);
            addCell(tblMensal, fmtKz(totalIvaDed), fNegrito, Element.ALIGN_RIGHT, COR_CINZA_BG);
            addCell(tblMensal, fmtKz(totalIvaEnt), fNegrito, Element.ALIGN_RIGHT, COR_CINZA_BG);
            addCell(tblMensal, fmtKz(totalGeral), fNegrito, Element.ALIGN_RIGHT, COR_CINZA_BG);
        } else {
            PdfPCell semDados = new PdfPCell(new Phrase("Nenhum documento fiscal emitido no ano " + ano + ".", fPequeno));
            semDados.setColspan(7);
            semDados.setPadding(12);
            semDados.setHorizontalAlignment(Element.ALIGN_CENTER);
            tblMensal.addCell(semDados);
        }
        doc.add(tblMensal);

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO C — DETALHE DIÁRIO DE FACTURAÇÃO
        // ═══════════════════════════════════════════════════════════════════════════
        doc.add(secaoTitle("C  |  DETALHE DIÁRIO DE FACTURAÇÃO — " + ano, fSecao));

        for (Object[] rowMes : dadosMensais) {
            int mes = ((Number) rowMes[0]).intValue();
            List<Object[]> diario = mapDiario.get(mes);
            if (diario == null || diario.isEmpty()) continue;

            BigDecimal totalDiaBase = BigDecimal.ZERO, totalDiaIva = BigDecimal.ZERO, totalDiaValor = BigDecimal.ZERO;
            long totalDiaDocs = 0L;

            Paragraph subtitulo = new Paragraph("▸ " + MESES[mes] + " de " + ano, fSubTitulo);
            subtitulo.setSpacingBefore(6);
            subtitulo.setSpacingAfter(4);
            doc.add(subtitulo);

            PdfPTable tblDiario = new PdfPTable(5);
            tblDiario.setWidthPercentage(100);
            tblDiario.setSpacingAfter(8);
            tblDiario.setWidths(new float[]{1.2f, 0.9f, 1.6f, 1.4f, 1.4f});

            String[] colsDiario = {"DATA", "Nº DOCS", "BASE TRIBUTÁVEL", "IVA LIQUIDADO", "TOTAL"};
            for (String col : colsDiario) addCellHeader(tblDiario, col, fHeader, COR_AZUL);

            int linhaDia = 0;
            for (Object[] dia : diario) {
                int d        = ((Number) dia[0]).intValue();
                long qtd     = dia[1] != null ? ((Number) dia[1]).longValue() : 0L;
                BigDecimal vrTotal = nvl((BigDecimal) dia[2]);
                BigDecimal vrIva   = nvl((BigDecimal) dia[3]);
                BigDecimal vrBase  = nvl((BigDecimal) dia[4]);

                Color bgD = linhaDia % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;
                addCell(tblDiario, String.format("%02d/%02d/%d", d, mes, ano), fNormal, Element.ALIGN_CENTER, bgD);
                addCell(tblDiario, String.valueOf(qtd), fNormal, Element.ALIGN_CENTER, bgD);
                addCell(tblDiario, fmtKz(vrBase), fNormal, Element.ALIGN_RIGHT, bgD);
                addCell(tblDiario, fmtKz(vrIva), fNormal, Element.ALIGN_RIGHT, bgD);
                addCell(tblDiario, fmtKz(vrTotal), fNormal, Element.ALIGN_RIGHT, bgD);

                totalDiaBase  = totalDiaBase.add(vrBase);
                totalDiaIva   = totalDiaIva.add(vrIva);
                totalDiaValor = totalDiaValor.add(vrTotal);
                totalDiaDocs += qtd;
                linhaDia++;
            }

            // Subtotal do mês
            addCell(tblDiario, "Subtotal " + MESES_ABR[mes], fNegrito, Element.ALIGN_CENTER, COR_BEGE_BG);
            addCell(tblDiario, String.valueOf(totalDiaDocs), fNegrito, Element.ALIGN_CENTER, COR_BEGE_BG);
            addCell(tblDiario, fmtKz(totalDiaBase), fNegrito, Element.ALIGN_RIGHT, COR_BEGE_BG);
            addCell(tblDiario, fmtKz(totalDiaIva), fNegrito, Element.ALIGN_RIGHT, COR_BEGE_BG);
            addCell(tblDiario, fmtKz(totalDiaValor), fNegrito, Element.ALIGN_RIGHT, COR_BEGE_BG);
            doc.add(tblDiario);
        }

        if (dadosMensais.isEmpty()) {
            Paragraph semDias = new Paragraph("Sem movimentos diários para o ano " + ano + ".", fPequeno);
            semDias.setSpacingBefore(4);
            semDias.setIndentationLeft(10);
            doc.add(semDias);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO D — PERFIL DE FACTURAÇÃO
        // ═══════════════════════════════════════════════════════════════════════════
        doc.add(secaoTitle("D  |  PERFIL DE FACTURAÇÃO — " + ano, fSecao));

        // D.1 — Por Método de Pagamento
        if (!metodosPagto.isEmpty()) {
            Paragraph pMet = new Paragraph("D.1  Distribuição por Método de Pagamento", fSubTitulo);
            pMet.setSpacingBefore(6);
            pMet.setSpacingAfter(4);
            doc.add(pMet);

            PdfPTable tblMet = new PdfPTable(3);
            tblMet.setWidthPercentage(100);
            tblMet.setSpacingAfter(8);
            tblMet.setWidths(new float[]{1.8f, 1.5f, 1f});

            addCellHeader(tblMet, "MÉTODO DE PAGAMENTO", fHeader, COR_AZUL);
            addCellHeader(tblMet, "TOTAL FATURADO", fHeader, COR_AZUL);
            addCellHeader(tblMet, "Nº OPERAÇÕES", fHeader, COR_AZUL);

            int lMet = 0;
            for (Object[] row : metodosPagto) {
                Color bgM = lMet % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;
                addCell(tblMet, row[0] != null ? row[0].toString() : "N/I", fNormal, Element.ALIGN_LEFT, bgM);
                addCell(tblMet, fmtKz((BigDecimal) row[1]), fNormal, Element.ALIGN_RIGHT, bgM);
                addCell(tblMet, String.valueOf(((Number) row[2]).longValue()), fNormal, Element.ALIGN_CENTER, bgM);
                lMet++;
            }
            doc.add(tblMet);
        }

        // D.2 — Por Tipo de Documento
        if (!tiposDoc.isEmpty()) {
            Paragraph pTip = new Paragraph("D.2  Distribuição por Tipo de Documento", fSubTitulo);
            pTip.setSpacingBefore(6);
            pTip.setSpacingAfter(4);
            doc.add(pTip);

            PdfPTable tblTip = new PdfPTable(3);
            tblTip.setWidthPercentage(100);
            tblTip.setSpacingAfter(8);
            tblTip.setWidths(new float[]{1.8f, 1.5f, 1f});

            addCellHeader(tblTip, "TIPO DE DOCUMENTO", fHeader, COR_AZUL);
            addCellHeader(tblTip, "TOTAL FATURADO", fHeader, COR_AZUL);
            addCellHeader(tblTip, "Nº EMITIDOS", fHeader, COR_AZUL);

            int lTip = 0;
            for (Object[] row : tiposDoc) {
                Color bgT = lTip % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;
                String label = row[0] != null ? row[0].toString().replace("_", " ") : "N/I";
                addCell(tblTip, label, fNormal, Element.ALIGN_LEFT, bgT);
                addCell(tblTip, fmtKz((BigDecimal) row[1]), fNormal, Element.ALIGN_RIGHT, bgT);
                addCell(tblTip, String.valueOf(((Number) row[2]).longValue()), fNormal, Element.ALIGN_CENTER, bgT);
                lTip++;
            }
            doc.add(tblTip);
        }

        // D.3 — Por Estado
        if (!estadosFat.isEmpty()) {
            Paragraph pEst = new Paragraph("D.3  Situação dos Documentos", fSubTitulo);
            pEst.setSpacingBefore(6);
            pEst.setSpacingAfter(4);
            doc.add(pEst);

            PdfPTable tblEst = new PdfPTable(3);
            tblEst.setWidthPercentage(100);
            tblEst.setSpacingAfter(8);
            tblEst.setWidths(new float[]{1.8f, 1.5f, 1f});

            addCellHeader(tblEst, "ESTADO", fHeader, COR_AZUL);
            addCellHeader(tblEst, "VALOR TOTAL", fHeader, COR_AZUL);
            addCellHeader(tblEst, "QTD", fHeader, COR_AZUL);

            int lEst = 0;
            for (Object[] row : estadosFat) {
                Color bgE = lEst % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;
                addCell(tblEst, row[0] != null ? row[0].toString() : "N/I", fNormal, Element.ALIGN_LEFT, bgE);
                addCell(tblEst, fmtKz((BigDecimal) row[1]), fNormal, Element.ALIGN_RIGHT, bgE);
                addCell(tblEst, String.valueOf(((Number) row[2]).longValue()), fNormal, Element.ALIGN_CENTER, bgE);
                lEst++;
            }
            doc.add(tblEst);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO E — TOP 5 CLIENTES
        // ═══════════════════════════════════════════════════════════════════════════
        if (!topClientes.isEmpty()) {
            doc.add(secaoTitle("E  |  TOP 5 CLIENTES — " + ano, fSecao));

            PdfPTable tblCli = new PdfPTable(3);
            tblCli.setWidthPercentage(100);
            tblCli.setSpacingAfter(14);
            tblCli.setWidths(new float[]{2.5f, 1.5f, 1f});

            addCellHeader(tblCli, "CLIENTE", fHeader, COR_AZUL);
            addCellHeader(tblCli, "FACTURAÇÃO TOTAL", fHeader, COR_AZUL);
            addCellHeader(tblCli, "Nº DOCS", fHeader, COR_AZUL);

            int limite = Math.min(topClientes.size(), 5);
            int lCli = 0;
            for (int i = 0; i < limite; i++) {
                Object[] row = topClientes.get(i);
                Color bgC = lCli % 2 == 0 ? Color.WHITE : COR_LINHA_PAR;
                addCell(tblCli, row[0] != null ? row[0].toString() : "N/I", fNormal, Element.ALIGN_LEFT, bgC);
                addCell(tblCli, fmtKz((BigDecimal) row[1]), fNormal, Element.ALIGN_RIGHT, bgC);
                addCell(tblCli, String.valueOf(((Number) row[2]).longValue()), fNormal, Element.ALIGN_CENTER, bgC);
                lCli++;
            }
            doc.add(tblCli);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        //  SEÇÃO F — APURAMENTO DO IVA
        // ═══════════════════════════════════════════════════════════════════════════
        doc.add(secaoTitle("F  |  APURAMENTO DO IVA — " + ano, fSecao));

        PdfPTable tblApura = new PdfPTable(2);
        tblApura.setWidthPercentage(100);
        tblApura.setSpacingAfter(14);
        tblApura.setWidths(new float[]{3.2f, 1.5f});

        addLinhaResumo(tblApura, "F.1  IVA Liquidado nas Vendas (Art. 22.º CIVA)",   fmtKz(totalIvaFaturas), fNormal, fNegrito, false);
        addLinhaResumo(tblApura, "F.2  IVA Dedutível nas Compras (Art. 19.º CIVA)",  fmtKz(ivaDedutivel),    fNormal, fNegrito, true);
        addLinhaResumo(tblApura, "═  IVA Líquido (F.1 − F.2)",                      fmtKz(ivaLiquido),      fNegrito, fNegrito, false);

        Font fVermelho = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, COR_VERMELHO);
        PdfPCell cAp1 = cellResumo("▶  IVA a ENTREGAR AO ESTADO", fVermelho, COR_BEGE_BG);
        PdfPCell cAp2 = cellResumo(fmtKz(ivaAPagar), fVermelho, COR_BEGE_BG);
        cAp2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tblApura.addCell(cAp1);
        tblApura.addCell(cAp2);

        if (ivaARecuperar.compareTo(BigDecimal.ZERO) > 0) {
            Font fVerde = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, COR_VERDE_CLARO);
            PdfPCell cAp3 = cellResumo("▶  IVA a RECUPERAR (Crédito Fiscal)", fVerde, COR_CINZA_BG);
            PdfPCell cAp4 = cellResumo(fmtKz(ivaARecuperar), fVerde, COR_CINZA_BG);
            cAp4.setHorizontalAlignment(Element.ALIGN_RIGHT);
            tblApura.addCell(cAp3);
            tblApura.addCell(cAp4);
        }
        doc.add(tblApura);

        // ═══════════════════════════════════════════════════════════════════════════
        //  NOTA LEGAL
        // ═══════════════════════════════════════════════════════════════════════════
        Paragraph nota = new Paragraph();
        nota.setSpacingBefore(10);

        Font fNotaTit = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COR_VERDE);
        Font fNota    = FontFactory.getFont(FontFactory.HELVETICA, 7, COR_CINZA_TEXT);

        nota.add(new Phrase("NOTA LEGAL E INFORMAÇÕES COMPLEMENTARES\n\n", fNotaTit));

        String lines = """
                O presente relatório foi gerado automaticamente pelo sistema Kamba Gestão com base nos
                documentos fiscais emitidos e nos movimentos de compras registados no ano de %d.
                Os valores apresentados seguem as disposições do Código do IVA (CIVA) — Lei n.º 7/19
                de 24 de Abril, República de Angola.
                                
                — Art. 19.º CIVA: Direito à dedução do IVA suportado nas aquisições de bens e serviços
                  (apenas aplicável a contribuintes enquadrados no Regime Geral).
                — Art. 22.º CIVA: Liquidação do IVA nas operações tributáveis e apuramento do imposto
                  a entregar ao Estado.
                — Decreto Presidencial n.º 34/09: Regime Jurídico das Facturas e Documentos Equivalentes.
                                
                Legenda:
                  IVA Liquidado    = IVA cobrado nas vendas (a entregar ao Estado)
                  IVA Dedutível    = IVA suportado nas compras a fornecedores (a deduzir)
                  IVA a Entregar   = IVA Liquidado − IVA Dedutível (quando positivo)
                  Crédito Fiscal   = IVA Dedutível − IVA Liquidado (quando negativo, a recuperar)
                                
                Data de emissão: %s
                Contribuinte: %s (NIF: %s)
                """.formatted(ano, LocalDate.now().format(FMT_DATA), empresa.getNome(),
                        empresa.getNif() != null ? empresa.getNif() : "N/I");

        nota.add(new Phrase(lines, fNota));
        doc.add(nota);

        doc.close();
        return out.toByteArray();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    //  MÉTODOS AUXILIARES
    // ═══════════════════════════════════════════════════════════════════════════════

    private BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private String fmtKz(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) == 0) return "0,00 Kz";
        return String.format("%,.2f Kz", valor);
    }

    private String fmtLong(Long valor) {
        if (valor == null) return "0";
        return String.format("%,d", valor);
    }

    private String fmtPct(BigDecimal valor) {
        if (valor == null) return "0%";
        return valor.stripTrailingZeros().toPlainString() + "%";
    }

    // ─── Linha separadora de secção ──────────────────────────────────────────────
    private PdfPTable secaoTitle(String titulo, Font font) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setSpacingBefore(14);
        t.setSpacingAfter(6);
        PdfPCell c = new PdfPCell(new Phrase(titulo, font));
        c.setBackgroundColor(COR_VERDE);
        c.setPadding(7);
        c.setHorizontalAlignment(Element.ALIGN_LEFT);
        c.setBorder(PdfPCell.NO_BORDER);
        t.addCell(c);
        return t;
    }

    // ─── Adiciona linha informativa no cabeçalho ─────────────────────────────────
    private void addInfoRow(PdfPTable table, String texto, Font font, boolean negrito, Color bgColor) {
        PdfPCell c = new PdfPCell(new Phrase(texto, font));
        c.setBorder(PdfPCell.NO_BORDER);
        c.setPadding(1);
        if (bgColor != null) c.setBackgroundColor(bgColor);
        if (negrito) {
            c.setPadding(3);
        }
        table.addCell(c);
    }

    // ─── Linha de resumo com label e valor ────────────────────────────────────────
    private void addLinhaResumo(PdfPTable table, String label, String valor,
                                Font fontLabel, Font fontValue, boolean alternar) {
        Color bg = alternar ? COR_CINZA_BG : Color.WHITE;
        PdfPCell c1 = cellResumo(label, fontLabel, bg);
        PdfPCell c2 = cellResumo(valor, fontValue, bg);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c1);
        table.addCell(c2);
    }

    // ─── Célula de resumo ────────────────────────────────────────────────────────
    private PdfPCell cellResumo(String texto, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, font));
        cell.setPadding(5);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(COR_BORDA);
        return cell;
    }

    // ─── Célula de cabeçalho de tabela ───────────────────────────────────────────
    private void addCellHeader(PdfPTable table, String texto, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(COR_BORDA);
        table.addCell(cell);
    }

    // ─── Célula normal de tabela ─────────────────────────────────────────────────
    private void addCell(PdfPTable table, String texto, Font font, int alinhamento, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, font));
        cell.setPadding(4);
        cell.setHorizontalAlignment(alinhamento);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(COR_BORDA);
        table.addCell(cell);
    }
}
