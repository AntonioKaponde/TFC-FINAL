package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "artigos", indexes = {
    @Index(name = "idx_artigo_empresa", columnList = "empresaId"),
    @Index(name = "idx_artigo_empresa_nome", columnList = "empresaId, nome")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, length = 50)
    private String sku;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoriaId")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fornecedorId")
    private Fornecedor fornecedor;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal preco;

    /**
     * Preço de custo (preço de compra ao fornecedor).
     * Usado para calcular o IVA dedutível (IVA a Recuperar) conforme CIVA Angola.
     * O IVA a Recuperar = precoCusto × taxaIva (apenas para Regime Geral, Art. 19.º CIVA).
     */
    @Column(precision = 15, scale = 2)
    private BigDecimal precoCusto;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaIva;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private Integer stockMinimo;

    @Column
    private String motivoIsencao;

    @Column
    private String unidadeMedida;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoArtigo estado;

    @ManyToOne
    private Fatura fatura;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;

    public void atualizarEstado() {
        if (stock <= 0) {
            estado = EstadoArtigo.SEM_STOCK;
        } else if (stock <= stockMinimo) {
            estado = EstadoArtigo.STOCK_BAIXO;
        } else {
            estado = EstadoArtigo.EM_STOCK;
        }
    }
}
