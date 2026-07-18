package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoriaRequest {
    @NotBlank
    private String nome;
    private String descricao;
}
