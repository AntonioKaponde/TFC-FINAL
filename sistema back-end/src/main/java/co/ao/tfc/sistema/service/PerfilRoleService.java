package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.PerfilRoleDto;
import co.ao.tfc.sistema.dto.PerfilRoleRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.Permissao;
import co.ao.tfc.sistema.repository.PerfilRoleRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerfilRoleService {

    private final PerfilRoleRepository perfilRoleRepository;
    private final UsuarioRepository usuarioRepository;

    private Set<Permissao> getDefaultPermissionsForRole(String nome) {
        if (nome == null) return new HashSet<>();
        switch (nome.toUpperCase()) {
            case "ADMIN":
            case "NOVOADMIN":
                return new HashSet<>(Arrays.asList(Permissao.values()));
            case "GERENTE":
            case "GERENTE DE ESTOQUE": // nome antigo — mantido por compatibilidade com empresas já criadas
                return new HashSet<>(Arrays.asList(
                        Permissao.USUARIO_VIEW,
                        Permissao.FORNECEDOR_VIEW, Permissao.FORNECEDOR_EDIT,
                        Permissao.DASHBOARD_VIEW,
                        Permissao.FATURAMENTO_VIEW,
                        Permissao.INVENTARIO_VIEW, Permissao.INVENTARIO_EDIT,
                        Permissao.CLIENTES_VIEW,
                        Permissao.CONFIG_VIEW,
                        Permissao.AUDITORIA_VIEW
                ));
            case "CONTABILISTA":
                return new HashSet<>(Arrays.asList(
                        Permissao.DASHBOARD_VIEW,
                        Permissao.FATURAMENTO_VIEW,
                        Permissao.SAFT_VIEW,
                        Permissao.CONFIG_VIEW,
                        Permissao.AUDITORIA_VIEW
                ));
            case "OPERADOR":
                return new HashSet<>(Arrays.asList(
                        Permissao.USUARIO_VIEW,
                        Permissao.FORNECEDOR_VIEW, Permissao.FORNECEDOR_EDIT,
                        Permissao.DASHBOARD_VIEW,
                        Permissao.FATURAMENTO_VIEW, Permissao.FATURAMENTO_EDIT,
                        Permissao.INVENTARIO_VIEW,
                        Permissao.CLIENTES_VIEW, Permissao.CLIENTES_EDIT,
                        Permissao.CONFIG_VIEW
                ));
            default:
                return new HashSet<>();
        }
    }

    private Usuario getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador não autenticado"));
    }

    @Transactional
    public List<PerfilRoleDto> listarRolesDaEmpresa() {
        Empresa empresa = getCurrentUser().getEmpresa();
        List<PerfilRole> roles = perfilRoleRepository.findByEmpresa(empresa);
        
        if (roles.isEmpty()) {
            roles = new java.util.ArrayList<>();
            roles.add(perfilRoleRepository.save(PerfilRole.builder()
                    .nome("Admin")
                    .permissoes(new HashSet<>(Arrays.asList(Permissao.values())))
                    .empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder()
                    .nome("Gerente")
                    .permissoes(new HashSet<>(Arrays.asList(
                            Permissao.USUARIO_VIEW,
                            Permissao.FORNECEDOR_VIEW, Permissao.FORNECEDOR_EDIT,
                            Permissao.DASHBOARD_VIEW,
                            Permissao.FATURAMENTO_VIEW,
                            Permissao.INVENTARIO_VIEW, Permissao.INVENTARIO_EDIT,
                            Permissao.CLIENTES_VIEW,
                            Permissao.CONFIG_VIEW,
                            Permissao.AUDITORIA_VIEW
                    )))
                    .empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder()
                    .nome("Contabilista")
                    .permissoes(new HashSet<>(Arrays.asList(
                            Permissao.DASHBOARD_VIEW,
                            Permissao.FATURAMENTO_VIEW,
                            Permissao.SAFT_VIEW,
                            Permissao.CONFIG_VIEW,
                            Permissao.AUDITORIA_VIEW
                    )))
                    .empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder()
                    .nome("Operador")
                    .permissoes(new HashSet<>(Arrays.asList(
                            Permissao.USUARIO_VIEW,
                            Permissao.FORNECEDOR_VIEW, Permissao.FORNECEDOR_EDIT,
                            Permissao.DASHBOARD_VIEW,
                            Permissao.FATURAMENTO_VIEW, Permissao.FATURAMENTO_EDIT,
                            Permissao.INVENTARIO_VIEW,
                            Permissao.CLIENTES_VIEW, Permissao.CLIENTES_EDIT,
                            Permissao.CONFIG_VIEW
                    )))
                    .empresa(empresa).build()));
        } else {
            // Migração: preencher permissoes em falta para roles existentes que estão vazias
            for (PerfilRole role : roles) {
                if (role.getPermissoes() == null || role.getPermissoes().isEmpty()) {
                    Set<Permissao> defaultPerms = getDefaultPermissionsForRole(role.getNome());
                    if (!defaultPerms.isEmpty()) {
                        role.setPermissoes(defaultPerms);
                        perfilRoleRepository.save(role);
                    }
                }
            }
        }
        
        // Remover possíveis papéis duplicados pelo nome que possam ter sido criados anteriormente
        Map<String, PerfilRoleDto> rolesUnicos = new HashMap<>();
        for (PerfilRole role : roles) {
            String nome = role.getNome();
            if (!rolesUnicos.containsKey(nome)) {
                rolesUnicos.put(nome, PerfilRoleDto.builder()
                        .id(role.getId())
                        .nome(nome)
                        .permissoes(role.getPermissoes())
                        .usersCount(role.getUsuarios() != null ? role.getUsuarios().size() : 0)
                        .build());
            } else {
                // Se já existir, podemos somar os usuários para o DTO (opcional, mas bom se houver usuários no papel duplicado)
                PerfilRoleDto existente = rolesUnicos.get(nome);
                existente.setUsersCount(existente.getUsersCount() + (role.getUsuarios() != null ? role.getUsuarios().size() : 0));
            }
        }
        
        return new ArrayList<>(rolesUnicos.values());
    }

    @Transactional
    public void criarRole(PerfilRoleRequest request) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O sistema permite apenas 4 tipos de usuários: Admin, Gerente, Contabilista e Operador. Não é possível criar novos papéis.");
    }

    @Transactional
    public void atualizarRole(Long id, PerfilRoleRequest request) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O sistema permite apenas 4 tipos de usuários: Admin, Gerente, Contabilista e Operador. Não é possível alterar os papéis padrão.");
    }

    @Transactional
    public void deletarRole(Long id) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "O sistema permite apenas 4 tipos de usuários: Admin, Gerente, Contabilista e Operador. Não é possível deletar os papéis padrão.");
    }
}
