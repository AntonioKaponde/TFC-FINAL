package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FornecedorRequest {

    @NotBlank
    private String nome;

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "^(5\\d{9}|00\\d{7}[A-Za-z]{2}\\d{3})$", message = "O NIF deve ser de uma Empresa (10 dígitos iniciados por 5) ou Particular (14 caracteres iniciados por 00 com 2 letras).")
    private String nif;

    @jakarta.validation.constraints.Pattern(regexp = "^$|^9\\d{8}$", message = "O telefone deve ter exactamente 9 dígitos e começar com 9 (padrão angolano).")
    private String telefone;
    
    @jakarta.validation.constraints.Email(message = "Email inválido")
    private String email;

    private String endereco;

    /**
     * Descrição dos produtos/serviços que este fornecedor fornece.
     * Ex: "Computadores, Impressoras, Material de escritório".
     */
    private String produtosFornecidos;

    private boolean ativo = true;
}

