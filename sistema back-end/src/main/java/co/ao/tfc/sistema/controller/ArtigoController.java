package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.ArtigoRequest;
import co.ao.tfc.sistema.dto.ArtigoResponse;
import co.ao.tfc.sistema.service.ArtigoService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artigos")
@RequiredArgsConstructor
public class ArtigoController {

    private final ArtigoService artigoService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'GERENTE DE ESTOQUE', 'OPERADOR')")
    public List<ArtigoResponse> listar(@RequestParam(required = false) String pesquisa) {
        return artigoService.listar(pesquisa);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'GERENTE DE ESTOQUE', 'OPERADOR')")
    public ArtigoResponse buscar(@PathVariable Long id) {
        return artigoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ArtigoResponse criar(@Valid @RequestBody ArtigoRequest request) {
        ArtigoResponse response = artigoService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "Artigo", "Criou o artigo " + response.getNome());
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public ArtigoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ArtigoRequest request) {
        ArtigoResponse response = artigoService.atualizar(id, request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Artigo", "Atualizou o artigo " + response.getNome());
        return response;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void remover(@PathVariable Long id) {
        artigoService.remover(id);
        auditoriaService.registrarAuditoria("REMOVEU", "Artigo", "Removeu o artigo com ID " + id);
    }
}
