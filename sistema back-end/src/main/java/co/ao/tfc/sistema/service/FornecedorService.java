package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.FornecedorRequest;
import co.ao.tfc.sistema.dto.FornecedorResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Fornecedor;
import co.ao.tfc.sistema.repository.FornecedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;
    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado")).getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponse> listar(String pesquisa) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        List<Fornecedor> fornecedores = fornecedorRepository.findByEmpresa(empresa);

        if (pesquisa != null && !pesquisa.isBlank()) {
            fornecedores = fornecedores.stream().filter(f -> f.getNome().toLowerCase().contains(pesquisa.toLowerCase())).toList();
        }

        return fornecedores.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FornecedorResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    /**
     * Busca o fornecedor mais adequado para um determinado produto/artigo.
     * Procura nos campos produtosFornecidos de cada fornecedor da empresa.
     * Retorna o primeiro fornecedor cujos produtos fornecidos contêm o nome do artigo.
     */
    @Transactional(readOnly = true)
    public Optional<FornecedorResponse> buscarPorProduto(String nomeProduto) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        List<Fornecedor> fornecedores = fornecedorRepository.findByEmpresa(empresa);

        if (nomeProduto == null || nomeProduto.isBlank()) {
            return Optional.empty();
        }

        String nomeLower = nomeProduto.toLowerCase();

        return fornecedores.stream()
                .filter(f -> f.getProdutosFornecidos() != null
                        && !f.getProdutosFornecidos().isBlank()
                        && f.isAtivo()
                        && java.util.Arrays.stream(f.getProdutosFornecidos().split("[,;]+"))
                                .map(String::trim)
                                .anyMatch(p -> nomeLower.contains(p.toLowerCase()) || p.toLowerCase().contains(nomeLower)))
                .findFirst()
                .map(this::toResponse);
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest request) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        Fornecedor fornecedor = Fornecedor.builder()
                .nome(request.getNome())
                .nif(request.getNif())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .endereco(request.getEndereco())
                .produtosFornecidos(request.getProdutosFornecidos())
                .empresa(empresa)
                .ativo(request.isAtivo())
                .build();
        return toResponse(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse atualizar(Long id, FornecedorRequest request) {
        Fornecedor fornecedor = buscarEntidade(id);
        fornecedor.setNome(request.getNome());
        fornecedor.setNif(request.getNif());
        fornecedor.setTelefone(request.getTelefone());
        fornecedor.setEmail(request.getEmail());
        fornecedor.setEndereco(request.getEndereco());
        fornecedor.setProdutosFornecidos(request.getProdutosFornecidos());
        fornecedor.setAtivo(request.isAtivo());
        return toResponse(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public void remover(Long id) {
        fornecedorRepository.delete(buscarEntidade(id));
    }

    private Fornecedor buscarEntidade(Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado: " + id));
        if (!fornecedor.getEmpresa().getId().equals(getCurrentEmpresa().getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Este fornecedor pertence a outra empresa.");
        }
        return fornecedor;
    }

    private FornecedorResponse toResponse(Fornecedor fornecedor) {
        return FornecedorResponse.builder()
                .id(fornecedor.getId())
                .nome(fornecedor.getNome())
                .nif(fornecedor.getNif())
                .telefone(fornecedor.getTelefone())
                .email(fornecedor.getEmail())
                .endereco(fornecedor.getEndereco())
                .produtosFornecidos(fornecedor.getProdutosFornecidos())
                .ativo(fornecedor.isAtivo())
                .build();
    }
}
