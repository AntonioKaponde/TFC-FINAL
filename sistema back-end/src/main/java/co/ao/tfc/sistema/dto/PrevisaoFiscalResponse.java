package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PrevisaoFiscalResponse {

    /** Período da previsão (ex.: "Setembro 2026") */
    private String periodoPrevisao;

    /** Estimativa de IVA a pagar no próximo período */
    private BigDecimal previsaoIva;

    /** Estimativa de faturação do próximo período */
    private BigDecimal previsaoFaturacao;

    /** IVA liquidado no último mês com dados */
    private BigDecimal ivaUltimoMes;

    /** Variação percentual estimada face ao mês anterior */
    private BigDecimal variacaoIvaPercentual;

    /** Histórico mensal de impostos do ano corrente */
    private List<MesFiscalDTO> historico;

    /** Comparação entre o ano corrente e o anterior */
    private ComparacaoAnualDTO comparacaoAnoAnterior;

    /** IRT (apenas quando aplicável) */
    private IrtDTO irt;

    /** Obrigações fiscais próximas */
    private List<ObrigacaoFiscalDTO> obrigacoes;

    @Data
    @Builder
    public static class MesFiscalDTO {
        private String mes;
        private int ano;
        private BigDecimal faturacao;
        private BigDecimal ivaLiquidado;
        private BigDecimal ivaDedutivel;
        private BigDecimal ivaEntregar;
    }

    @Data
    @Builder
    public static class ComparacaoAnualDTO {
        private BigDecimal faturacaoAtual;
        private BigDecimal faturacaoAnoAnterior;
        /** Percentagem de variação (pode ser negativa) */
        private BigDecimal variacaoPercentual;
    }

    @Data
    @Builder
    public static class IrtDTO {
        private boolean aplicavel;
        private BigDecimal irtAcumulado;
        private String observacao;
    }
}
