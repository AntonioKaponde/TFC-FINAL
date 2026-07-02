package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.MetodoPagamento;
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

    @NotNull
    private boolean pagoPronto;

    private MetodoPagamento metodoPagamento;

    @NotEmpty
    @Valid
    private List<LinhaFaturaRequest> linhas;
}
