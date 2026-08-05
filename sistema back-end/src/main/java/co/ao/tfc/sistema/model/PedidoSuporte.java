package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.CategoriaSuporte;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import co.ao.tfc.sistema.model.enums.PrioridadeSuporte;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido de suporte criado por um utilizador e gerido pelo administrador do sistema.
 */
@Entity
@Table(name = "pedidos_suporte")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoSuporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Assunto / título do problema (ex.: "Erro ao emitir factura") */
    @Column(nullable = false, length = 150)
    private String assunto;

    /** Descrição detalhada da dificuldade encontrada */
    @Column(nullable = false, length = 2000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private CategoriaSuporte categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PrioridadeSuporte prioridade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSuporte estado = EstadoSuporte.ABERTO;

    /** Nota/resposta do suporte (preenchida pelo administrador) */
    @Column(length = 2000)
    private String observacao;

    /** true enquanto o administrador ainda não visualizou o pedido (usado nas notificações) */
    @Column(nullable = false)
    @Builder.Default
    private boolean visto = false;

    /** Nome do utilizador que criou o pedido */
    @Column(nullable = false)
    private String nomeUtilizador;

    @Column(nullable = false)
    private String emailUtilizador;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column
    private LocalDateTime dataAtualizacao;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AnexoSuporte> anexos = new ArrayList<>();

    public void adicionarAnexo(AnexoSuporte anexo) {
        anexos.add(anexo);
        anexo.setPedido(this);
    }
}
