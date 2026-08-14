package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.ClienteRequest;
import co.ao.tfc.sistema.dto.ClienteResponse;
import co.ao.tfc.sistema.service.ClienteService;
import co.ao.tfc.sistema.service.AuditoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;
    private final AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONTABILISTA')")
    public List<ClienteResponse> listar(@RequestParam(required = false) String pesquisa) {
        return clienteService.listar(pesquisa);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'CONTABILISTA')")
    public ClienteResponse buscar(@PathVariable Long id) {
        return clienteService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ClienteResponse criar(@Valid @RequestBody ClienteRequest request) {
        ClienteResponse response = clienteService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "Cliente", "Criou o cliente " + response.getNome());
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest request) {
        ClienteResponse response = clienteService.atualizar(id, request);
        auditoriaService.registrarAuditoria("ATUALIZOU", "Cliente", "Atualizou o cliente " + response.getNome());
        return response;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void remover(@PathVariable Long id) {
        clienteService.remover(id);
        auditoriaService.registrarAuditoria("REMOVEU", "Cliente", "Removeu o cliente com ID " + id);
    }
}
