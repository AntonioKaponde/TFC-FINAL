package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.EmpresaRegisterRequest;
import co.ao.tfc.sistema.dto.EmpresaResponse;
import co.ao.tfc.sistema.dto.EmpresaUpdate;
import co.ao.tfc.sistema.dto.EmpresaUpdateRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.service.EmpresaService;
import co.ao.tfc.sistema.service.AuditoriaService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class EmpresaController {
    private final EmpresaService empresaService;
    private final AuditoriaService auditoriaService;

    @PostMapping("/empresa")
    public ResponseEntity<EmpresaResponse>  CriarEmpresa(@RequestBody EmpresaRegisterRequest request) {
        var empresa = empresaService.registerEmpresa(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(empresa);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmpresaUpdate> updateEmpresa(@PathVariable("id") Long id, @RequestBody EmpresaUpdateRequest request){
        var update = empresaService.updateEmpresa(request, id);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Empresa", "Atualizou os dados da empresa");
        return ResponseEntity.status(HttpStatus.OK).body(update);
    }


}
