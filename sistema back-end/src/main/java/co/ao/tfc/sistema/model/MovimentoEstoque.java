package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimentos_estoque")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimentoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "artigo_id")
    private Artigo artigo;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, length = 20)
    private String tipoMovimento; // ENTRADA, SAIDA, AJUSTE, DEVOLUCAO

    @Column(length = 500)
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @Column(name = "data_movimento", nullable = false)
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(nullable = false, length = 255)
    private String usuario;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockAntes = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockDepois = 0;
}
