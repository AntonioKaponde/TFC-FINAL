package co.ao.tfc.sistema.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fornecedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String nif;

    private String telefone;

    private String email;

    private String endereco;

    /**
     * Descrição dos produtos/serviços fornecidos por este fornecedor.
     * Ex: "Computadores, Impressoras, Acessórios de informática".
     * Utilizado para auto-associar artigos ao fornecedor correcto.
     */
    @Column(length = 500)
    private String produtosFornecidos;

    @Column(nullable = false)
    private boolean ativo;

    @ManyToOne
    @JoinColumn(name = "empresaId")
    private Empresa empresa;
}
