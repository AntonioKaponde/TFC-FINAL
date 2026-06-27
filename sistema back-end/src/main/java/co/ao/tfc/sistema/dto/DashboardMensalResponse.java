package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardMensalResponse {
    private String mes;
    private BigDecimal lucro;
    private BigDecimal imposto;
}
