package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.EmpresaDetalheResponse;
import co.ao.tfc.sistema.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresa")
@RequiredArgsConstructor
public class EmpresaLogadaController {

    private final EmpresaService empresaService;

    @GetMapping("/atual")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<EmpresaDetalheResponse> obterEmpresaAtual() {
        return ResponseEntity.ok(empresaService.obterEmpresaAtual());
    }

    @org.springframework.web.bind.annotation.PutMapping("/atual")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'CONTABILISTA')")
    public ResponseEntity<co.ao.tfc.sistema.dto.EmpresaUpdate> atualizarEmpresaAtual(@org.springframework.web.bind.annotation.RequestBody co.ao.tfc.sistema.dto.EmpresaUpdateRequest request) {
        Long empresaId = empresaService.obterEmpresaAtual().getId();
        return ResponseEntity.ok(empresaService.updateEmpresa(request, empresaId));
    }
}
