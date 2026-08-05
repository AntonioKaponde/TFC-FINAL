package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class ObrigacaoFiscalDTO {
    private String descricao;
    /** Período a que se refere a obrigação (ex.: "Agosto 2026") */
    private String periodoReferencia;
    private LocalDate dataLimite;
    private long diasRestantes;
    /** VENCIDA, PRÓXIMA, EM_DIA ou PROGRAMADA */
    private String status;
    private String detalhe;
}
