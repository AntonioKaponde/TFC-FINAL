package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.CategoriaRequest;
import co.ao.tfc.sistema.dto.CategoriaResponse;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE', 'OPERADOR')")
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public CategoriaResponse criar(@Valid @RequestBody CategoriaRequest request) {
        CategoriaResponse response = categoriaService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "Categoria", "Criou a categoria " + response.getNome());
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public CategoriaResponse atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        CategoriaResponse response = categoriaService.atualizar(id, request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Categoria", "Atualizou a categoria " + response.getNome());
        return response;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public void remover(@PathVariable Long id) {
        String nome = categoriaService.listar().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst().map(CategoriaResponse::getNome).orElse("ID " + id);
        categoriaService.remover(id);
        auditoriaService.registrarAuditoria("REMOVEU", "Categoria", "Removeu a categoria " + nome);
    }
}
