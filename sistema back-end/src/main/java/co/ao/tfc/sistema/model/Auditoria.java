package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String operacao; // Ex: CRIACAO, ATUALIZACAO, REMOCAO, ACESSO

    @Column(nullable = false)
    private String entidade; // Ex: Fatura, Cliente, Artigo, Usuario

    @Column(nullable = false, length = 1000)
    private String detalhes; // Descricao do que foi feito

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false)
    private String usuario; // Nome ou email de quem fez a alteracao

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
}
