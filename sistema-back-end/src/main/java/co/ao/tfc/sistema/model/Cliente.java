package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "clientes", indexes = {
    @Index(name = "idx_cliente_empresa", columnList = "empresaId"),
    @Index(name = "idx_cliente_nif", columnList = "nif")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String nif;

    private String telefone;

    private String email;

    @Column(precision = 15, scale = 2)
    private BigDecimal saldo;

    @Column(nullable = false, length = 20)
    private String codigoCliente;

    @Column(nullable = false)
    private boolean ativo;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;
}
