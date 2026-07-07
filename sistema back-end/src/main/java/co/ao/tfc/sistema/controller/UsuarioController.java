package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.UsuarioDto;
import co.ao.tfc.sistema.dto.UsuarioRequest;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuariosDaEmpresa());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> criarUsuario(@Valid @RequestBody UsuarioRequest request) {
        try {
            usuarioService.criarUsuario(request);
            auditoriaService.registrarAuditoria("CRIOU", "Usuario", "Criou o usuário " + request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário criado com sucesso");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> removerUsuario(@PathVariable Long id) {
        try {
            usuarioService.removerUsuario(id);
            auditoriaService.registrarAuditoria("REMOVEU", "Usuario", "Removeu o usuário com ID " + id);
            return ResponseEntity.ok("Usuário removido com sucesso.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
