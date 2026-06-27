package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.RegimeIva;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ConfiguracaoFiscalResponse {
    private Long id;
    private RegimeIva regimeIva;
    private BigDecimal taxaIva;
    private String motivoIsencaoPadrao;
    private boolean aplicarIrt;
    private boolean aplicarImpostoSelo;
}
