package co.ao.tfc.sistema.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class FaturaRequest {

    @NotNull
    private Long clienteId;

    @NotNull
    private LocalDate dataEmissao;

    @NotNull
    private LocalDate dataVencimento;

    @NotEmpty
    @Valid
    private List<LinhaFaturaRequest> linhas;
}
