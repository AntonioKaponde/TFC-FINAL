package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.RegimeIva;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "configuracao_fiscal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegimeIva regimeIva;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaIva;

    @Column(length = 10)
    private String motivoIsencaoPadrao;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;
}
