package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.PerfilRoleDto;
import co.ao.tfc.sistema.dto.PerfilRoleRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.PerfilRoleRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerfilRoleService {

    private final PerfilRoleRepository perfilRoleRepository;
    private final UsuarioRepository usuarioRepository;

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
            roles.add(perfilRoleRepository.save(PerfilRole.builder().nome("Admin").empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder().nome("Gerente").empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder().nome("Contabilista").empresa(empresa).build()));
            roles.add(perfilRoleRepository.save(PerfilRole.builder().nome("Operador").empresa(empresa).build()));
        }
        
        return roles.stream().map(role -> {
            return PerfilRoleDto.builder()
                    .id(role.getId())
                    .nome(role.getNome())
                    .permissoes(role.getPermissoes())
                    .usersCount(role.getUsuarios() != null ? role.getUsuarios().size() : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void criarRole(PerfilRoleRequest request) {
        Usuario currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getPerfilRoles().stream()
                .anyMatch(r -> r.getNome().equalsIgnoreCase("Admin") || r.getNome().equalsIgnoreCase("NovoAdmin"));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: Apenas administradores podem criar novos papéis e permissões.");
        }

        Empresa empresa = currentUser.getEmpresa();
        
        long totalRoles = perfilRoleRepository.countByEmpresa(empresa);
        if (totalRoles >= 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível criar mais papéis. O sistema está limitado a 4 papéis base.");
        }
        
        PerfilRole role = PerfilRole.builder()
                .nome(request.getNome())
                .permissoes(request.getPermissoes())
                .empresa(empresa)
                .build();
                
        perfilRoleRepository.save(role);
    }

    @Transactional
    public void atualizarRole(Long id, PerfilRoleRequest request) {
        Usuario currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getPerfilRoles().stream()
                .anyMatch(r -> r.getNome().equalsIgnoreCase("Admin") || r.getNome().equalsIgnoreCase("NovoAdmin"));
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: Apenas administradores podem atualizar papéis e permissões.");
        }

        PerfilRole role = perfilRoleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Papel não encontrado"));
                
        if (!role.getEmpresa().getId().equals(currentUser.getEmpresa().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }

        role.setNome(request.getNome());
        role.setPermissoes(request.getPermissoes());
        perfilRoleRepository.save(role);
    }
}
