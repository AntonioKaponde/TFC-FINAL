package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "O email não pode estar vazio")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "A password não pode estar vazia")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    private String password;
}
