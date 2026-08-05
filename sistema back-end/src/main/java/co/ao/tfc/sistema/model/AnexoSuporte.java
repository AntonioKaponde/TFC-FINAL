package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Anexo (imagem ou documento, ex.: print de erro) de um pedido de suporte.
 * O ficheiro é guardado em disco; apenas os metadados são persistidos na base de dados.
 */
@Entity
@Table(name = "anexos_suporte")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnexoSuporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome original do ficheiro enviado pelo utilizador (ex.: erro-fatura.png) */
    @Column(nullable = false)
    private String nomeOriginal;

    /** Nome único gerado no servidor (UUID + extensão) para evitar colisões */
    @Column(nullable = false)
    private String nomeArmazenado;

    @Column(nullable = false)
    private String tipoConteudo;

    @Column(nullable = false)
    private Long tamanho;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id")
    private PedidoSuporte pedido;
}
