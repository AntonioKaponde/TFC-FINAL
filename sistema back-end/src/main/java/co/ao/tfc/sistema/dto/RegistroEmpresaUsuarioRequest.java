package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.RegimeIva;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistroEmpresaUsuarioRequest {
    
    // Dados da Empresa
    @NotBlank(message = "O nome da empresa é obrigatório")
    private String nomeEmpresa;
    
    @NotBlank(message = "O NIF da empresa é obrigatório")
    @Pattern(regexp = "^5\\d{9}$", message = "O NIF da Empresa deve conter 10 dígitos e começar por 5.")
    private String nif;
    
    private String telefoneEmpresa;
    private String endereco;
    private String sector;
    private RegimeIva regimeIva;

    // Dados do Usuário Administrador
    @NotBlank(message = "O nome do administrador é obrigatório")
    private String nomeAdministrador;
    
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    @Pattern(regexp = ".*@gmail\\.com$", message = "O email deve ser um endereço @gmail.com")
    private String email;
    
    @NotBlank(message = "A password é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    private String password;
}
