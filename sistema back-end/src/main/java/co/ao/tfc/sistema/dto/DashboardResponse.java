package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {

    // Cards principais

    private BigDecimal faturacaoTotal;

    private BigDecimal ivaTotal;

    private Long totalFaturas;

    private Long faturasPagas;


    // Gráfico evolução mensal

    private List<ReceitaMensalDTO> faturacaoMensal;


    // Produtos

    private Long quantidadeProdutosVendidos;


    private BigDecimal valorMedioFatura;
}
