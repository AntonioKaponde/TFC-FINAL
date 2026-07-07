package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.FornecedorRequest;
import co.ao.tfc.sistema.dto.FornecedorResponse;
import co.ao.tfc.sistema.service.FornecedorService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {

    private final FornecedorService fornecedorService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    public List<FornecedorResponse> listar(@RequestParam(required = false) String pesquisa) {
        return fornecedorService.listar(pesquisa);
    }

    /**
     * Endpoint para auto-preenchimento do fornecedor ao criar um artigo.
     * Devolve o fornecedor que fornece o produto com o nome indicado.
     */
    @GetMapping("/por-produto")
    public org.springframework.http.ResponseEntity<FornecedorResponse> buscarPorProduto(@RequestParam String nome) {
        return fornecedorService.buscarPorProduto(nome)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public FornecedorResponse buscar(@PathVariable Long id) {
        return fornecedorService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public FornecedorResponse criar(@Valid @RequestBody FornecedorRequest request) {
        FornecedorResponse response = fornecedorService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "Fornecedor", "Criou o fornecedor " + response.getNome());
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERENTE')")
    public FornecedorResponse atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorRequest request) {
        FornecedorResponse response = fornecedorService.atualizar(id, request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Fornecedor", "Atualizou o fornecedor " + response.getNome());
        return response;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void remover(@PathVariable Long id) {
        fornecedorService.remover(id);
        auditoriaService.registrarAuditoria("REMOVEU", "Fornecedor", "Removeu o fornecedor com ID " + id);
    }
}
