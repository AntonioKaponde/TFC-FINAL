package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class PrevisaoStockResponse {

    private ResumoDTO resumo;
    private List<ArtigoPrevisaoDTO> artigos;

    @Data
    @Builder
    public static class ResumoDTO {
        private long totalArtigos;
        private long aAcabar;
        private long stockBaixo;
        private long parados;
        private long comSugestaoReposicao;
    }

    @Data
    @Builder
    public static class ArtigoPrevisaoDTO {
        private Long id;
        private String nome;
        private String sku;
        private String categoria;
        private BigDecimal preco;
        private Integer stockAtual;
        private Integer stockMinimo;

        /** Consumo médio mensal (unidades/mês) com base nos últimos 90 dias */
        private BigDecimal consumoMensal;

        /** Unidades vendidas nos últimos 90 dias */
        private Integer consumoUltimos90Dias;

        /** Quantos dias o stock atual suporta ao ritmo atual de consumo (null se sem vendas) */
        private Integer diasRestantes;

        private LocalDate ultimaVenda;

        /** BAIXA, MEDIA, ALTA ou SEM_VENDAS */
        private String velocidade;

        /** A_ACABAR, STOCK_BAIXO, PARADO, NORMAL ou SEM_STOCK */
        private String status;

        /** Quantidade sugerida de reposição (0 se não for recomendado repor) */
        private Integer sugestaoReposicao;
    }
}
