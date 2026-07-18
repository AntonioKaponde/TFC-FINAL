package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "linhas_fatura")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinhaFatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fatura_id")
    private Fatura fatura;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artigo_id")
    private Artigo artigo;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precoUnitario;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaIva;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalLinha;
}
