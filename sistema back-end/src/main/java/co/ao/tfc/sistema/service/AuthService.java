package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.LoginRequest;
import co.ao.tfc.sistema.dto.JwtAuthResponse;
import co.ao.tfc.sistema.dto.RegistroEmpresaUsuarioRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.EmpresaRepository;
import co.ao.tfc.sistema.repository.PerfilRoleRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import co.ao.tfc.sistema.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PerfilRoleRepository perfilRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public JwtAuthResponse autenticarUsuario(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        java.util.List<String> roles = usuario.getPerfilRoles().stream()
            .map(co.ao.tfc.sistema.model.PerfilRole::getNome)
            .collect(java.util.stream.Collectors.toList());

        return new JwtAuthResponse(jwt, usuario.getNome(), usuario.getEmail(), roles);
    }

    @Transactional
    public void registrarEmpresaEUsuario(RegistroEmpresaUsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Email já está em uso!");
        }

        // Criar Empresa
        Empresa empresa = Empresa.builder()
                .nome(request.getNomeEmpresa())
                .nif(request.getNif())
                .telefone(request.getTelefoneEmpresa())
                .endereco(request.getEndereco())
                .empresa(request.getSector() != null ? co.ao.tfc.sistema.model.enums.TipoEmpresa.valueOf(request.getSector()) : null)
                .regimeIva(request.getRegimeIva())
                .anoFiscal(java.time.LocalDate.now())
                .build();
        empresa = empresaRepository.save(empresa);

        // Criar perfis padrão para a empresa
        PerfilRole adminRole = perfilRoleRepository.save(PerfilRole.builder().nome("Admin").empresa(empresa).build());
        perfilRoleRepository.save(PerfilRole.builder().nome("Gerente").empresa(empresa).build());
        perfilRoleRepository.save(PerfilRole.builder().nome("Contabilista").empresa(empresa).build());
        perfilRoleRepository.save(PerfilRole.builder().nome("Operador").empresa(empresa).build());

        // Criar Usuario Administrador
        Usuario usuario = Usuario.builder()
                .nome(request.getNomeAdministrador())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .empresa(empresa)
                .ativo(true)
                .build();
        
        usuario.getPerfilRoles().add(adminRole);

        usuarioRepository.save(usuario);
    }
}
