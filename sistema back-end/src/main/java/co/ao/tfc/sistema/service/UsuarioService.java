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
                    .primeiroAcesso(u.isPrimeiroAcesso())
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
                .primeiroAcesso(true)
                .build();
                
        novoUsuario.getPerfilRoles().add(role);
        usuarioRepository.save(novoUsuario);
    }

    /**
     * Permite ao utilizador autenticado trocar a sua própria palavra-passe.
     * Valida a palavra-passe atual e, após a troca, marca o primeiro acesso como concluído.
     */
    @Transactional
    public void alterarPassword(String senhaAtual, String novaSenha) {
        Usuario usuario = getCurrentUser();

        if (!passwordEncoder.matches(senhaAtual, usuario.getPassword())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A palavra-passe atual está incorreta.");
        }

        if (novaSenha == null || novaSenha.length() < 8) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A nova palavra-passe deve ter pelo menos 8 caracteres.");
        }

        if (passwordEncoder.matches(novaSenha, usuario.getPassword())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A nova palavra-passe deve ser diferente da atual.");
        }

        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuario.setPrimeiroAcesso(false);
        usuarioRepository.save(usuario);
    }

    private boolean isAdmin(Usuario usuario) {
        return usuario.getPerfilRoles().stream()
                .anyMatch(r -> r.getNome().equalsIgnoreCase("Admin") || r.getNome().equalsIgnoreCase("NovoAdmin"));
    }

    @Transactional
    public void removerUsuario(Long id) {
        Usuario currentUser = getCurrentUser();
        boolean isAdmin = isAdmin(currentUser);
        if (!isAdmin) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Apenas administradores podem remover usuários.");
        }
        Usuario usuarioParaRemover = usuarioRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (!usuarioParaRemover.getEmpresa().getId().equals(currentUser.getEmpresa().getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Não pode remover um usuário de outra empresa.");
        }
        if (usuarioParaRemover.getId().equals(currentUser.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Não pode remover a si próprio.");
        }
        usuarioRepository.delete(usuarioParaRemover);
    }
}
