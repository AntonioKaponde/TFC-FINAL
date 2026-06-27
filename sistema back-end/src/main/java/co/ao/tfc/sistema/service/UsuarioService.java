package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.UsuarioDto;
import co.ao.tfc.sistema.dto.UsuarioRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.PerfilRoleRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRoleRepository perfilRoleRepository;
    private final PasswordEncoder passwordEncoder;

    private Usuario getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
    }

    public List<UsuarioDto> listarUsuariosDaEmpresa() {
        Empresa empresa = getCurrentUser().getEmpresa();
        return usuarioRepository.findByEmpresa(empresa).stream().map(u -> {
            String roleName = u.getPerfilRoles().isEmpty() ? "Sem Papel" : u.getPerfilRoles().iterator().next().getNome();
            return UsuarioDto.builder()
                    .id(u.getId())
                    .nome(u.getNome())
                    .email(u.getEmail())
                    .role(roleName)
                    .status(u.isAtivo() ? "Ativo" : "Inativo")
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void criarUsuario(UsuarioRequest request) {
        Usuario currentUser = getCurrentUser();
        
        boolean isAdmin = currentUser.getPerfilRoles().stream()
                .anyMatch(r -> r.getNome().equalsIgnoreCase("Admin") || r.getNome().equalsIgnoreCase("NovoAdmin"));
                
        if (!isAdmin) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Apenas administradores podem criar novos usuários.");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Email já está em uso!");
        }

        Empresa empresa = currentUser.getEmpresa();
        
        PerfilRole role = perfilRoleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Papel não encontrado"));
                
        if (role.getEmpresa() != null && !role.getEmpresa().getId().equals(empresa.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado ao Papel");
        }

        Usuario novoUsuario = Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .empresa(empresa)
                .ativo(true)
                .build();
                
        novoUsuario.getPerfilRoles().add(role);
        usuarioRepository.save(novoUsuario);
    }
}
