package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class LinhaFaturaResponse {
    private Long id;
    private String artigo;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal taxaIva;
    private BigDecimal totalLinha;
}
