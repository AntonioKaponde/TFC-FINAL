package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.Permissao;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class PerfilRoleRequest {
    @NotBlank(message = "O nome do papel é obrigatório")
    private String nome;
    private Set<Permissao> permissoes;
}
