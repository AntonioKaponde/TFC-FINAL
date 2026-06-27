package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ClienteRequest;
import co.ao.tfc.sistema.dto.ClienteResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(String pesquisa) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        // A pesquisa por nome com multi-tenancy pode precisar de um método customizado, mas como fallback podemos filtrar na stream
        List<Cliente> clientes = clienteRepository.findByEmpresa(empresa);
        
        if (pesquisa != null && !pesquisa.isBlank()) {
            clientes = clientes.stream().filter(c -> c.getNome().toLowerCase().contains(pesquisa.toLowerCase())).toList();
        }
        
        return clientes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        Cliente cliente = Cliente.builder()
                .nome(request.getNome())
                .nif(request.getNif())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .saldo(request.getSaldo())
                .empresa(empresa)
                .ativo(request.isAtivo())
                .build();
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscarEntidade(id);
        cliente.setNome(request.getNome());
        cliente.setNif(request.getNif());
        cliente.setTelefone(request.getTelefone());
        cliente.setEmail(request.getEmail());
        cliente.setSaldo(request.getSaldo());
        cliente.setAtivo(request.isAtivo());
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void remover(Long id) {
        clienteRepository.delete(buscarEntidade(id));
    }

    Cliente buscarEntidade(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + id));
        if (!cliente.getEmpresa().getId().equals(getCurrentEmpresa().getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Este cliente pertence a outra empresa.");
        }
        return cliente;
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return ClienteResponse.builder()
                .id(cliente.getId())
                .nome(cliente.getNome())
                .nif(cliente.getNif())
                .telefone(cliente.getTelefone())
                .email(cliente.getEmail())
                .saldo(cliente.getSaldo())
                //.empresa(cliente.getEmpresa())
                .ativo(cliente.isAtivo())
                .build();
    }
}
