package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.RegimeIva;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfiguracaoFiscalRequest {

    @NotNull
    private RegimeIva regimeIva;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal taxaIva;

    private String motivoIsencaoPadrao;
    private boolean aplicarIrt;
    private boolean aplicarImpostoSelo;
}
