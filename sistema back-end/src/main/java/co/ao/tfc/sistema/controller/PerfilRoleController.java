package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.PerfilRoleDto;
import co.ao.tfc.sistema.dto.PerfilRoleRequest;
import co.ao.tfc.sistema.service.PerfilRoleService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class PerfilRoleController {

    private final PerfilRoleService perfilRoleService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<PerfilRoleDto>> listarRoles() {
        return ResponseEntity.ok(perfilRoleService.listarRolesDaEmpresa());
    }

    @PostMapping
    public ResponseEntity<String> criarRole(@Valid @RequestBody PerfilRoleRequest request) {
        perfilRoleService.criarRole(request);
        auditoriaService.registrarAuditoria("CRIOU", "Papel", "Criou o papel " + request.getNome());
        return ResponseEntity.status(HttpStatus.CREATED).body("Papel criado com sucesso");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizarRole(@PathVariable Long id, @Valid @RequestBody PerfilRoleRequest request) {
        perfilRoleService.atualizarRole(id, request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Papel", "Atualizou o papel com ID " + id);
        return ResponseEntity.ok("Papel atualizado com sucesso");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletarRole(@PathVariable Long id) {
        perfilRoleService.deletarRole(id);
        auditoriaService.registrarAuditoria("REMOVEU", "Papel", "Removeu o papel com ID " + id);
        return ResponseEntity.ok("Papel removido com sucesso");
    }
}
