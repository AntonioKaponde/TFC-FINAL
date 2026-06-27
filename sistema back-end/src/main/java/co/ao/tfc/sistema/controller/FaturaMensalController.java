package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.FaturaMensalRequest;
import co.ao.tfc.sistema.dto.FaturaResponse;
import co.ao.tfc.sistema.service.FaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequestMapping
@RequiredArgsConstructor
public class FaturaMensalController {
    private final FaturaService faturaService;

    @PostMapping("/faturas-mensais-2024")
    public ResponseEntity<List<FaturaResponse>> criarMensais(
            @RequestBody FaturaMensalRequest request) {
        return ResponseEntity.ok(faturaService.criarFaturasMensais2024(request));
    }
}
