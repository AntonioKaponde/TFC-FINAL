package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String password;

    @Builder.Default
    private boolean ativo = true;

    /**
     * Indica que o utilizador foi criado pelo Administrador e ainda não
     * alterou a palavra-passe inicial. Enquanto for true, o sistema
     * obriga a troca de palavra-passe no primeiro acesso.
     */
    @Builder.Default
    private boolean primeiroAcesso = false;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "usuario_perfil_role",
            joinColumns = @JoinColumn(name="usuario_id"),
            inverseJoinColumns = @JoinColumn(name="perfil_role_id")
    )
    @Builder.Default
    private Set<PerfilRole> perfilRoles = new HashSet<>();

}
