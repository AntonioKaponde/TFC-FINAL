package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "O email não pode estar vazio")
    @Email(message = "Email inválido")
    @Pattern(regexp = ".*@gmail\\.com$", message = "O email deve ser um endereço @gmail.com")
    private String email;

    @NotBlank(message = "A password não pode estar vazia")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    private String password;
}
