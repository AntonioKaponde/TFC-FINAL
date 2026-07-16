package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.EmpresaDetalheResponse;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresa")
@RequiredArgsConstructor
public class EmpresaLogadaController {

    private final EmpresaService empresaService;
    private final AuditoriaService auditoriaService;

    @GetMapping("/atual")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<EmpresaDetalheResponse> obterEmpresaAtual() {
        return ResponseEntity.ok(empresaService.obterEmpresaAtual());
    }

    @PutMapping("/atual")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<co.ao.tfc.sistema.dto.EmpresaUpdate> atualizarEmpresaAtual(@RequestBody co.ao.tfc.sistema.dto.EmpresaUpdateRequest request) {
        Long empresaId = empresaService.obterEmpresaAtual().getId();
        co.ao.tfc.sistema.dto.EmpresaUpdate response = empresaService.updateEmpresa(request, empresaId);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Empresa", "Atualizou os dados da empresa");
        return ResponseEntity.ok(response);
    }
}
