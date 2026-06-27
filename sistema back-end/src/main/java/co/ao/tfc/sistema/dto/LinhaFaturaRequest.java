package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LinhaFaturaRequest {

    @NotNull
    private Long artigoId;

    @NotNull
    @Min(1)
    private Integer quantidade;
}
