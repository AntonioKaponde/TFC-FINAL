package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AlterarPasswordRequest {

    @NotBlank(message = "A palavra-passe atual é obrigatória")
    private String senhaAtual;

    @NotBlank(message = "A nova palavra-passe é obrigatória")
    @Size(min = 8, message = "A nova palavra-passe deve ter pelo menos 8 caracteres")
    private String novaSenha;
}
