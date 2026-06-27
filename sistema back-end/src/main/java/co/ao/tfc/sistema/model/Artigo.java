package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "artigos")
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

    @ManyToOne(optional = false)
    @JoinColumn(name = "categoriaId")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fornecedorId")
    private Fornecedor fornecedor;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal preco;

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
