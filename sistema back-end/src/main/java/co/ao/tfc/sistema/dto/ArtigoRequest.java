package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ArtigoRequest {

    @NotBlank
    private String nome;

    @NotBlank(message = "O código SKU é obrigatório")
    private String sku;

    @NotNull(message = "A categoria é obrigatória")
    private Long categoriaId;

    @NotNull(message = "O fornecedor é obrigatório")
    private Long fornecedorId;

    @NotNull(message = "O preço é obrigatório")
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

    /** Preço de custo ao fornecedor (opcional). Usado para calcular IVA a recuperar. */
    @DecimalMin("0.00")
    private BigDecimal precoCusto;
}
