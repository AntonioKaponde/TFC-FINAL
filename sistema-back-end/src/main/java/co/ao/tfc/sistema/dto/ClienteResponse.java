package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ClienteResponse {
    private Long id;
    private String nome;
    private String nif;
    private String telefone;
    private String email;
    private BigDecimal saldo;
    private String empresa;
    private String codigoCliente;
    private boolean ativo;
}
