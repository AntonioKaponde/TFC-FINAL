package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MovimentoEstoqueResponse {
    private Long id;
    private Long artigoId;
    private String artigoNome;
    private Integer quantidade;
    private String tipoMovimento;
    private String observacao;
    private String fornecedorNome;
    private LocalDateTime dataHora;
    private String usuario;
    private Integer stockAntes;
    private Integer stockDepois;
    /** IVA Dedutível desta compra. Apenas preenchido em ENTRADA com fornecedor. */
    private BigDecimal ivaCompra;
}

