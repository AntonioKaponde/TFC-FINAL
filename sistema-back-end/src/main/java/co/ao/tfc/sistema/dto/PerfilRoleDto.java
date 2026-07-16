package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.Permissao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilRoleDto {
    private Long id;
    private String nome;
    private Set<Permissao> permissoes;
    private int usersCount;
}
