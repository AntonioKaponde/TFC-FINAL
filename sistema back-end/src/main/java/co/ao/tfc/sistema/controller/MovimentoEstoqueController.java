package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.MovimentoEstoqueRequest;
import co.ao.tfc.sistema.dto.MovimentoEstoqueResponse;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.MovimentoEstoqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentos-estoque")
@RequiredArgsConstructor
public class MovimentoEstoqueController {

    private final MovimentoEstoqueService movimentoEstoqueService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    public List<MovimentoEstoqueResponse> listar() {
        return movimentoEstoqueService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public MovimentoEstoqueResponse criar(@Valid @RequestBody MovimentoEstoqueRequest request) {
        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(request);
        auditoriaService.registrarAuditoria(
                "MOVIMENTOU_STOCK",
                "MovimentoEstoque",
                "Movimento de stock: " + request.getTipoMovimento()
                        + " do artigo ID " + request.getArtigoId()
                        + " (" + request.getQuantidade() + " unidades)"
        );
        return response;
    }
}
