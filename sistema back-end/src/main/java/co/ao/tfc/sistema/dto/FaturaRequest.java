package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.MetodoPagamento;
import co.ao.tfc.sistema.model.enums.TipoDocumento;
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

    /**
     * Tipo de documento fiscal conforme Decreto n.º 34/09 Angola.
     * Quando não enviado, o sistema infere automaticamente:
     * - pagoPronto=true → FATURA_RECIBO
     * - pagoPronto=false → FATURA
     */
    private TipoDocumento tipoDocumento;

    @NotEmpty
    @Valid
    private List<LinhaFaturaRequest> linhas;
}

