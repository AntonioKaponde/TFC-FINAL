package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.model.Auditoria;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.AuditoriaRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaService.class);

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Regista uma operação de CRUD no sistema (imutável).
     */
    public void registrarAuditoria(String operacao, String entidade, String detalhes) {
        registrar(operacao, entidade, detalhes, null);
    }

    /**
     * Regista uma operação no sistema com IP (imutável).
     */
    public void registrarAuditoria(String operacao, String entidade, String detalhes, String ip) {
        registrar(operacao, entidade, detalhes, ip);
    }

    /**
     * Regista um login bem-sucedido no sistema.
     * O SecurityContext já contém a autenticação neste ponto.
     */
    public void registrarLogin(String email, String nome, String ip) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Empresa empresa = null;

            if (authentication != null && authentication.isAuthenticated()) {
                Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    empresa = userOpt.get().getEmpresa();
                }
            }

            Auditoria auditoria = Auditoria.builder()
                    .operacao("LOGIN")
                    .entidade("Sistema")
                    .detalhes("Utilizador autenticou-se no sistema")
                    .dataHora(LocalDateTime.now())
                    .usuario(nome + " (" + email + ")")
                    .ip(ip)
                    .empresa(empresa)
                    .build();

            auditoriaRepository.save(auditoria);
            log.info("Login registado: {} de IP {}", email, ip);
        } catch (Exception e) {
            log.error("Falha ao registar login: {}", e.getMessage());
        }
    }

    /**
     * Regista uma tentativa de login falhada.
     * Tenta obter a empresa mesmo em falha (se o email existir na base).
     */
    public void registrarLoginFalha(String email, String ip) {
        try {
            // Tenta obter a empresa mesmo em caso de falha (se o email existir)
            Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);
            Empresa empresa = userOpt.map(Usuario::getEmpresa).orElse(null);

            Auditoria auditoria = Auditoria.builder()
                    .operacao("LOGIN_FALHA")
                    .entidade("Sistema")
                    .detalhes("Tentativa de login falhou para o email: " + email)
                    .dataHora(LocalDateTime.now())
                    .usuario(email + " (não autenticado)")
                    .ip(ip)
                    .empresa(empresa)
                    .build();

            auditoriaRepository.save(auditoria);
            log.warn("Login falhou: {} de IP {}", email, ip);
        } catch (Exception e) {
            log.error("Falha ao registar login falhado: {}", e.getMessage());
        }
    }

    /**
     * Método interno que faz o registo real no banco de dados.
     * O registo é imutável - uma vez salvo, nunca deve ser alterado.
     */
    private void registrar(String operacao, String entidade, String detalhes, String ip) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                log.warn("Tentativa de registar auditoria sem autenticação: {}/{}", operacao, entidade);
                return;
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
                        .ip(ip)
                        .empresa(empresa)
                        .build();

                auditoriaRepository.save(auditoria);
                log.debug("Auditoria registada: {} em {} por {}", operacao, entidade, email);
            }
        } catch (Exception e) {
            log.error("Falha ao registar auditoria: {}", e.getMessage());
        }
    }

    /**
     * Lista todas as auditorias da empresa do utilizador autenticado.
     */
    public List<Auditoria> listarAuditorias() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario user = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return auditoriaRepository.findByEmpresaOrderByDataHoraDesc(user.getEmpresa());
    }

    /**
     * Lista auditorias filtradas por utilizador.
     */
    public List<Auditoria> listarAuditoriasPorUsuario(String usuario) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario user = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return auditoriaRepository.findByEmpresaAndUsuarioContainingIgnoreCaseOrderByDataHoraDesc(
                user.getEmpresa(), usuario);
    }

    /**
     * Lista auditorias de login (LOGIN, LOGIN_FALHA, REGISTO).
     */
    public List<Auditoria> listarAuditoriasDeAcesso() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario user = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return auditoriaRepository.findByEmpresaAndOperacaoInOrderByDataHoraDesc(
                user.getEmpresa(), Set.of("LOGIN", "LOGIN_FALHA", "REGISTO"));
    }
}
