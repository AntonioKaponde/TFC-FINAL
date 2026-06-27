package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.EstadoFatura;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "faturas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(nullable = false)
    private LocalDate dataEmissao;

    @Column(nullable = false)
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoFatura estado;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalIva;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total;

    @OneToMany(mappedBy = "fatura", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LinhaFatura> linhas = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;

    @OneToMany
    @JoinColumn(name = "artigoId")
    private Set<Artigo> artigos = new HashSet<>();

    @OneToMany(mappedBy = "fatura")
    private List<NotaCredito> notaCredito;

    public void adicionarLinha(LinhaFatura linha) {
        linhas.add(linha);
        linha.setFatura(this);
    }
}
