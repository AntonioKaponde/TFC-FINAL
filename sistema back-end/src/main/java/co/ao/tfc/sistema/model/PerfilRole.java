package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.Permissao;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "perfil_roles")
public class PerfilRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<Permissao> permissoes = new HashSet<>();

    @ManyToOne
    @JoinColumn(name="empresaId")
    private Empresa empresa;

    @ManyToMany(mappedBy="perfilRoles")
    @Builder.Default
    private Set<Usuario> usuarios = new HashSet<>();

}
