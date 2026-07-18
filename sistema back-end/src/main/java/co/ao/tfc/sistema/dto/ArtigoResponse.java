package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ArtigoResponse {
    private Long id;
    private String nome;
    private String sku;
    private Long categoriaId;
    private String categoria; // Nome da categoria
    private Long fornecedorId;
    private String fornecedorNome;
    private BigDecimal preco;
    private BigDecimal taxaIva;
    private Integer stock;
    private Integer stockMinimo;
    private EstadoArtigo estado;
    private String motivoIsencao;
    private String unidadeMedida;
    private BigDecimal precoCusto;
}
