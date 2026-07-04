package co.ao.tfc.sistema.model;

import co.ao.tfc.sistema.model.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Long id;

    @Column(name = "nome_da_empresa",unique = true)
    private String nome;
    @Column(name = "nif",unique = true)
    private String nif;
    @Column(name = "endereco")
    private String endereco;
    @Column(name = "telefone")
    private String telefone;
    @Column(name = "email",unique = true)
    private String email;
    @Column(name = "capital_social",unique = true)
    private BigDecimal capitalSocial;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_de_empresa")
    private TipoEmpresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(name = "regime_iva")
    private RegimeIva regimeIva;

    @Enumerated(EnumType.STRING)
    private IsencaoIva iva;

    @Column(name = "ano_fiscal")
    private LocalDate anoFiscal = LocalDate.now();

    @Column(name = "prefixo_fatura")
    private String prefixoFatura;

    @OneToMany(mappedBy = "empresa")
    private List<Fatura> fatura;

    @OneToMany(mappedBy = "empresa",cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<Usuario> usuarios = new HashSet<>();

    @OneToMany(mappedBy = "empresa")
    private List<PerfilRole> perfilRole;

    @OneToMany(mappedBy = "empresa")
    private Set<Cliente> cliente = new HashSet<>();

    @OneToMany(mappedBy = "empresa")
    private Set<Fornecedor> fornecedor = new HashSet<>();


}
