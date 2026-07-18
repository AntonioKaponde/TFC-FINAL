package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.NotaCreditoRequest;
import co.ao.tfc.sistema.dto.NotaCreditoResponse;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.NotaCreditoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-credito")
@RequiredArgsConstructor
public class NotaCreditoController {

    private final NotaCreditoService notaCreditoService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<NotaCreditoResponse>> listar() {
        return ResponseEntity.ok(notaCreditoService.listar());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public ResponseEntity<NotaCreditoResponse> criar(@Valid @RequestBody NotaCreditoRequest request) {
        NotaCreditoResponse response = notaCreditoService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "NotaCredito", "Criou nota de crédito " + response.getNumero() + " para fatura " + response.getFaturaNumero());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
