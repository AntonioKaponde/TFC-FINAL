package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.NotaCreditoRequest;
import co.ao.tfc.sistema.dto.NotaCreditoResponse;
import co.ao.tfc.sistema.service.NotaCreditoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-credito")
@RequiredArgsConstructor
public class NotaCreditoController {

    private final NotaCreditoService notaCreditoService;

    @GetMapping
    public ResponseEntity<List<NotaCreditoResponse>> listar() {
        return ResponseEntity.ok(notaCreditoService.listar());
    }

    @PostMapping
    public ResponseEntity<NotaCreditoResponse> criar(@Valid @RequestBody NotaCreditoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notaCreditoService.criar(request));
    }
}
