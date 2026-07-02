package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.LoginRequest;
import co.ao.tfc.sistema.dto.JwtAuthResponse;
import co.ao.tfc.sistema.dto.RegistroEmpresaUsuarioRequest;
import co.ao.tfc.sistema.service.AuthService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuditoriaService auditoriaService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String ip = obterIp(request);
        JwtAuthResponse response = authService.autenticarUsuario(loginRequest, ip);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerEmpresaEUsuario(
            @Valid @RequestBody RegistroEmpresaUsuarioRequest registroRequest,
            HttpServletRequest request) {
        try {
            authService.registrarEmpresaEUsuario(registroRequest);
            // Regista o registo da empresa na auditoria
            String ip = obterIp(request);
            auditoriaService.registrarAuditoria("REGISTO", "Empresa",
                    "Nova empresa registada: " + registroRequest.getNomeEmpresa(), ip);
            return ResponseEntity.status(HttpStatus.CREATED).body("Empresa e Administrador registados com sucesso.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    private String obterIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Se for múltiplos IPs (X-Forwarded-For), pega o primeiro
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
