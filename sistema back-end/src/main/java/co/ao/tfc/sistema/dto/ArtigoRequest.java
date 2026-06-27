package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ArtigoRequest {

    @NotBlank
    private String nome;

    @NotNull
    private Long categoriaId;

    private Long fornecedorId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal preco;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    private BigDecimal taxaIva;

    @NotNull
    @Min(0)
    private Integer stock;

    @NotNull
    @Min(0)
    private Integer stockMinimo;

    private String motivoIsencao;

    private String unidadeMedida;
}
