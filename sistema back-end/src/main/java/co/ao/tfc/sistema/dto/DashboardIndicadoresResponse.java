package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardIndicadoresResponse {
    private BigDecimal faturacaoBruta;
    /** IVA liquidado nas vendas — a entregar à AGT conforme Art. 22.º CIVA Angola */
    private BigDecimal ivaAPagar;
    /** IVA dedutível das compras — a recuperar conforme Art. 19.º CIVA Angola (apenas Regime Geral) */
    private BigDecimal ivaARecuperar;
    /** IVA líquido a entregar ao Estado = IVA a Pagar - IVA a Recuperar */
    private BigDecimal ivaLiquido;

    private BigDecimal totalImpostos;
    private BigDecimal lucroRetido;
    private BigDecimal taxaIvaAplicada;
}
