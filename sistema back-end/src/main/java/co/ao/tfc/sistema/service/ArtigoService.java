package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ArtigoRequest;
import co.ao.tfc.sistema.dto.ArtigoResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtigoService {

    private final ArtigoRepository artigoRepository;
    private final co.ao.tfc.sistema.repository.UsuarioRepository usuarioRepository;
    private final co.ao.tfc.sistema.repository.CategoriaRepository categoriaRepository;
    private final co.ao.tfc.sistema.repository.FornecedorRepository fornecedorRepository;
    private final MovimentoEstoqueService movimentoEstoqueService;


    private co.ao.tfc.sistema.model.Usuario getCurrentUsuario() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
    }

    private co.ao.tfc.sistema.model.Empresa getCurrentEmpresa() {
        return getCurrentUsuario().getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<ArtigoResponse> listar(String pesquisa) {
        co.ao.tfc.sistema.model.Empresa empresa = getCurrentEmpresa();
        List<Artigo> artigos = artigoRepository.findByEmpresa(empresa);
        
        if (pesquisa != null && !pesquisa.isBlank()) {
            artigos = artigos.stream().filter(a -> 
                a.getNome().toLowerCase().contains(pesquisa.toLowerCase()) || 
                (a.getCategoria() != null && a.getCategoria().getNome().toLowerCase().contains(pesquisa.toLowerCase()))
            ).toList();
        }
        
        return artigos.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ArtigoResponse buscar(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Transactional
    public ArtigoResponse criar(ArtigoRequest request) {
        co.ao.tfc.sistema.model.Usuario usuarioLogado = getCurrentUsuario();
        co.ao.tfc.sistema.model.Empresa empresa = usuarioLogado.getEmpresa();

        co.ao.tfc.sistema.model.Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        if (artigoRepository.existsByNomeIgnoreCaseAndEmpresa(request.getNome(), empresa)) {
            throw new IllegalArgumentException("Já existe um artigo registado com este nome.");
        }

        co.ao.tfc.sistema.model.Fornecedor fornecedor = null;
        if (request.getFornecedorId() != null) {
            fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado"));
            // Validação: verificar se o fornecedor fornece este tipo de produto
            validarFornecedorProduto(fornecedor, request.getNome());
        }

        Artigo artigo = Artigo.builder()
                .nome(request.getNome())
                .sku(request.getSku())
                .categoria(categoria)
                .fornecedor(fornecedor)
                .preco(request.getPreco())
                .precoCusto(request.getPrecoCusto())
                .taxaIva(request.getTaxaIva())
                .motivoIsencao(request.getMotivoIsencao())
                .unidadeMedida(request.getUnidadeMedida())
                .stock(0) // Inicialmente 0, será ajustado pelo movimento de estoque inicial
                .stockMinimo(request.getStockMinimo())
                .empresa(empresa)
                .build();
        artigo.atualizarEstado();
        artigo = artigoRepository.save(artigo);

        if (request.getStock() != null && request.getStock() > 0) {
            co.ao.tfc.sistema.dto.MovimentoEstoqueRequest movReq = new co.ao.tfc.sistema.dto.MovimentoEstoqueRequest();
            movReq.setArtigoId(artigo.getId());
            movReq.setQuantidade(request.getStock());
            movReq.setTipoMovimento("ENTRADA");
            movReq.setObservacao("Estoque inicial - Cadastro de Artigo");
            movReq.setFornecedorId(request.getFornecedorId());
            movReq.setPrecoCustoUnitario(request.getPrecoCusto());
            
            movimentoEstoqueService.criar(movReq);
            
            artigo = buscarEntidade(artigo.getId());
        }

        return toResponse(artigo);
    }

    @Transactional
    public ArtigoResponse atualizar(Long id, ArtigoRequest request) {
        Artigo artigo = buscarEntidade(id);

        co.ao.tfc.sistema.model.Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        co.ao.tfc.sistema.model.Fornecedor fornecedor = null;
        if (request.getFornecedorId() != null) {
            fornecedor = fornecedorRepository.findById(request.getFornecedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Fornecedor não encontrado"));
            // Validação: verificar se o fornecedor fornece este tipo de produto
            validarFornecedorProduto(fornecedor, request.getNome());
        }

        artigo.setNome(request.getNome());
        artigo.setSku(request.getSku());
        artigo.setCategoria(categoria);
        artigo.setFornecedor(fornecedor);
        artigo.setPreco(request.getPreco());
        artigo.setPrecoCusto(request.getPrecoCusto());
        artigo.setTaxaIva(request.getTaxaIva());
        artigo.setMotivoIsencao(request.getMotivoIsencao());
        artigo.setUnidadeMedida(request.getUnidadeMedida());

        if (!artigo.getStock().equals(request.getStock())) {
            artigo.setStock(request.getStock());
        }

        artigo.setStockMinimo(request.getStockMinimo());
        artigo.atualizarEstado();
        return toResponse(artigoRepository.save(artigo));
    }

    @Transactional
    public void remover(Long id) {
        artigoRepository.delete(buscarEntidade(id));
    }

    public Artigo buscarEntidade(Long id) {
        Artigo artigo = artigoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artigo não encontrado: " + id));
        if (!artigo.getEmpresa().getId().equals(getCurrentEmpresa().getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Acesso negado: Este artigo pertence a outra empresa.");
        }
        return artigo;
    }

    /**
     * Valida que o fornecedor fornece o produto indicado.
     * Se o campo produtosFornecidos estiver vazio, a associação é permitida (sem restrição).
     * Se estiver preenchido, verifica se algum dos produtos listados corresponde ao nome do artigo.
     */
    private void validarFornecedorProduto(co.ao.tfc.sistema.model.Fornecedor fornecedor, String nomeArtigo) {
        String produtosFornecidos = fornecedor.getProdutosFornecidos();
        if (produtosFornecidos == null || produtosFornecidos.isBlank()) {
            return; // Sem restrição — fornecedor não especificou produtos
        }
        String nomeLower = nomeArtigo.toLowerCase();
        boolean corresponde = java.util.Arrays.stream(produtosFornecidos.split("[,;]+"))
                .map(String::trim)
                .anyMatch(p -> nomeLower.contains(p.toLowerCase()) || p.toLowerCase().contains(nomeLower));
        if (!corresponde) {
            throw new IllegalArgumentException(
                "O fornecedor '" + fornecedor.getNome() + "' não fornece o produto '" + nomeArtigo +
                "'. Produtos deste fornecedor: " + produtosFornecidos);
        }
    }

    private ArtigoResponse toResponse(Artigo artigo) {
        return ArtigoResponse.builder()
                .id(artigo.getId())
                .nome(artigo.getNome())
                .sku(artigo.getSku())
                .categoriaId(artigo.getCategoria() != null ? artigo.getCategoria().getId() : null)
                .categoria(artigo.getCategoria() != null ? artigo.getCategoria().getNome() : null)
                .fornecedorId(artigo.getFornecedor() != null ? artigo.getFornecedor().getId() : null)
                .fornecedorNome(artigo.getFornecedor() != null ? artigo.getFornecedor().getNome() : null)
                .preco(artigo.getPreco())
                .precoCusto(artigo.getPrecoCusto())
                .taxaIva(artigo.getTaxaIva())
                .stock(artigo.getStock())
                .stockMinimo(artigo.getStockMinimo())
                .estado(artigo.getEstado())
                .motivoIsencao(artigo.getMotivoIsencao())
                .unidadeMedida(artigo.getUnidadeMedida())
                .build();
    }
}
