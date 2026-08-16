package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequest {
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    private String password;

    @NotNull(message = "O papel (role) é obrigatório")
    private Long roleId;
}
