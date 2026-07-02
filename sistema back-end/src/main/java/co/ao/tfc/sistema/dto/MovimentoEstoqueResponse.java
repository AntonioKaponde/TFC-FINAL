package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MovimentoEstoqueResponse {
    private Long id;
    private Long artigoId;
    private String artigoNome;
    private Integer quantidade;
    private String tipoMovimento;
    private String observacao;
    private String fornecedorNome;
    private LocalDateTime dataHora;
    private String usuario;
    private Integer stockAntes;
    private Integer stockDepois;
}
