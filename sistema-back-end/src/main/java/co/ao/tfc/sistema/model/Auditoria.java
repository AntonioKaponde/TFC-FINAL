package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registo de auditoria imutável.
 * Uma vez criado, não pode ser alterado ou removido via código.
 * Apenas o banco de dados (INSERT) deve persistir estes registos.
 */
@Entity
@Table(name = "auditoria")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA precisa de construtor vazio
@AllArgsConstructor
@Builder
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String operacao; // LOGIN, LOGIN_FALHA, REGISTO, CRIOU, ATUALIZOU, REMOVEU, ACESSO

    @Column(nullable = false, length = 50)
    private String entidade; // Fatura, Cliente, Artigo, Usuario, Sistema, etc.

    @Column(nullable = false, length = 1000)
    private String detalhes; // Descrição do que foi feito

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime dataHora = LocalDateTime.now();

    @Column(nullable = false, length = 255)
    private String usuario; // Nome do utilizador que executou a ação

    @Column(length = 45)
    private String ip; // Endereço IP de quem executou a ação

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
}
