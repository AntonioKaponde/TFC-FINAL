package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotaCredito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    private LocalDateTime dataEmissao;

    @ManyToOne
    @JoinColumn(name = "faturaId")
    private Fatura fatura;

    private String motivo;

    private BigDecimal subtotal;

    private BigDecimal valorIva;

    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;
}
