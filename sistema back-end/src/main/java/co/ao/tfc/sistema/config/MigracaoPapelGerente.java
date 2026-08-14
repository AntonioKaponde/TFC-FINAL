package co.ao.tfc.sistema.config;

import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.repository.PerfilRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Uniformiza o nome do papel de gestor em TODO o sistema (empresas novas e já
 * criadas): qualquer variação antiga ("Gerente de estoque", "Gestor de
 * estoque", ...) passa a chamar-se simplesmente "Gerente".
 *
 * A execução é idempotente (só renomeia quem ainda tem o nome antigo) e corre
 * no arranque da aplicação, antes de qualquer pedido — como o filtro de
 * autenticação lê os papéis da BD a cada pedido, a correção aplica-se
 * imediatamente, sem necessidade de novo login.
 */
@Component
@RequiredArgsConstructor
public class MigracaoPapelGerente implements CommandLineRunner {

    private final PerfilRoleRepository perfilRoleRepository;

    @Override
    public void run(String... args) {
        List<PerfilRole> roles = perfilRoleRepository.findAll();
        boolean alterado = false;

        for (PerfilRole role : roles) {
            if (role.getNome() == null) continue;
            String nome = role.getNome().trim();
            if (nome.equalsIgnoreCase("Gerente de estoque")
                    || nome.equalsIgnoreCase("Gestor de estoque")) {
                role.setNome("Gerente");
                perfilRoleRepository.save(role);
                alterado = true;
            }
        }

        if (alterado) {
            System.out.println("[MigracaoPapelGerente] Papéis de gestor renomeados para \"Gerente\".");
        }
    }
}
