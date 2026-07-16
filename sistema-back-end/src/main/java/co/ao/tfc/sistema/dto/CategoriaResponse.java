package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaResponse {
    private Long id;
    private String nome;
    private String descricao;
}
