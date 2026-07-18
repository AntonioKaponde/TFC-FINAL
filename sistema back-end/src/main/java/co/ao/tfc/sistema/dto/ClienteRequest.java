package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClienteRequest {

    @NotBlank
    private String nome;

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "^(5\\d{9}|00\\d{7}[A-Za-z]{2}\\d{3})$", message = "O NIF deve ser de uma Empresa (10 dígitos iniciados por 5) ou Particular (14 caracteres iniciados por 00 com 2 letras).")
    private String nif;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^9\\d{8}$", message = "O telefone deve ter 9 dígitos e começar com 9.")
    private String telefone;
    
    @jakarta.validation.constraints.Email(message = "Email inválido")
    @jakarta.validation.constraints.Pattern(regexp = ".*@gmail\\.com$", message = "O email deve ser um endereço @gmail.com")
    private String email;
    private BigDecimal saldo;
    private String empresa;
    private String codigoCliente;
    private boolean ativo = true;
}
