package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FornecedorResponse {
    private Long id;
    private String nome;
    private String nif;
    private String telefone;
    private String email;
    private String endereco;
    private String produtosFornecidos;
    private boolean ativo;
}
