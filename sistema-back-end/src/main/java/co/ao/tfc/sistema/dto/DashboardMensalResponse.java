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
    /** IVA dedutível das compras a fornecedor no mês (Art. 19.º CIVA Angola) */
    private BigDecimal ivaDedutivel;
}
