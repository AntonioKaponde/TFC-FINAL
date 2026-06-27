package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.LoginRequest;
import co.ao.tfc.sistema.dto.JwtAuthResponse;
import co.ao.tfc.sistema.dto.RegistroEmpresaUsuarioRequest;
import co.ao.tfc.sistema.service.AuthService;
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

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.autenticarUsuario(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerEmpresaEUsuario(@Valid @RequestBody RegistroEmpresaUsuarioRequest registroRequest) {
        try {
            authService.registrarEmpresaEUsuario(registroRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body("Empresa e Administrador registados com sucesso.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
