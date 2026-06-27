package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardIndicadoresResponse {
    private BigDecimal faturacaoBruta;
    private BigDecimal ivaAPagar;
    private BigDecimal irtRetido;
    private BigDecimal outrosImpostos;
    private BigDecimal totalImpostos;
    private BigDecimal lucroRetido;
    private BigDecimal taxaIvaAplicada;
}
