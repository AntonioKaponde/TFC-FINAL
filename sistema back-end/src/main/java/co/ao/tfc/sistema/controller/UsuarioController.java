package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.UsuarioDto;
import co.ao.tfc.sistema.dto.UsuarioRequest;
import co.ao.tfc.sistema.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuariosDaEmpresa());
    }

    @PostMapping
    public ResponseEntity<String> criarUsuario(@Valid @RequestBody UsuarioRequest request) {
        try {
            usuarioService.criarUsuario(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário criado com sucesso");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
