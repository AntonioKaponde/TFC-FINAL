package co.ao.tfc.sistema.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmpresaDetalheResponse {
    private Long id;
    private String nome;
    private String nif;
    private String telefone;
    private String email;
    private String endereco;
    private String empresa; // tipo de empresa
    private BigDecimal capitalSocial;
    private String regimeIva;
    private String industrial;
    private String retencaoNaFonte;
    private String iva;
    private String prefixoFatura;
    private LocalDate anoFiscal;
}
