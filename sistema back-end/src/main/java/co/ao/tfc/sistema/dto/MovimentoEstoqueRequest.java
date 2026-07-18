package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MovimentoEstoqueRequest {

    @NotNull
    private Long artigoId;

    @NotNull
    @Min(1)
    private Integer quantidade;

    @NotBlank
    private String tipoMovimento; // ENTRADA, SAIDA, AJUSTE, DEVOLUCAO

    private String observacao;

    private Long fornecedorId;

    /**
     * Preço de custo unitário da compra ao fornecedor.
     * Deve ser informado em movimentos ENTRADA com fornecedor para calcular o IVA Dedutível.
     * Se nulo, será usado o precoCusto registado no artigo como fallback.
     */
    private BigDecimal precoCustoUnitario;
}

