package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.Auditoria;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.AuditoriaRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public void registrarAuditoria(String operacao, String entidade, String detalhes) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return; // Nao registra auditoria para operacoes nao autenticadas
            }

            String email = authentication.getName();
            Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                Usuario user = userOpt.get();
                Empresa empresa = user.getEmpresa();

                Auditoria auditoria = Auditoria.builder()
                        .operacao(operacao)
                        .entidade(entidade)
                        .detalhes(detalhes)
                        .dataHora(LocalDateTime.now())
                        .usuario(user.getNome() + " (" + email + ")")
                        .empresa(empresa)
                        .build();

                auditoriaRepository.save(auditoria);
            }
        } catch (Exception e) {
            // Logar falha silenciosamente para não interromper fluxo principal
            System.err.println("Falha ao registrar auditoria: " + e.getMessage());
        }
    }

    public List<Auditoria> listarAuditorias() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario user = usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return auditoriaRepository.findByEmpresaOrderByDataHoraDesc(user.getEmpresa());
    }
}
