package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.MovimentoEstoqueRequest;
import co.ao.tfc.sistema.dto.MovimentoEstoqueResponse;
import co.ao.tfc.sistema.exception.ResourceNotFoundException;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fornecedor;
import co.ao.tfc.sistema.model.MovimentoEstoque;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FornecedorRepository;
import co.ao.tfc.sistema.repository.MovimentoEstoqueRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentoEstoqueService {

    private final MovimentoEstoqueRepository movimentoEstoqueRepository;
    private final ArtigoRepository artigoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoFiscalRepository configuracaoFiscalRepository;

    private Usuario getCurrentUsuario() {
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não autenticado"));
    }

    private Empresa getCurrentEmpresa() {
        return getCurrentUsuario().getEmpresa();
    }

    @Transactional(readOnly = true)
    public List<MovimentoEstoqueResponse> listar() {
        Empresa empresa = getCurrentEmpresa();
        return movimentoEstoqueRepository.findByEmpresaOrderByDataHoraDesc(empresa)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Corrige artigos existentes que têm precoCusto = 0 (bug da versão anterior).
     * Define precoCusto como null para que o sistema saiba que não há custo definido,
     * forçando o utilizador a informar o precoCustoUnitário nos movimentos de stock.
     */
    @Transactional
    public int corrigirArtigosPrecoCustoZero() {
        Empresa empresa = getCurrentEmpresa();
        List<Artigo> artigosCorrigir = artigoRepository.findByEmpresaAndPrecoCusto(empresa, BigDecimal.ZERO);
        for (Artigo a : artigosCorrigir) {
            a.setPrecoCusto(null);
        }
        artigoRepository.saveAll(artigosCorrigir);
        return artigosCorrigir.size();
    }

    /**
     * Recalcula o IVA Dedutível para movimentos ENTRADA com fornecedor que:
     * - Têm ivaCompra = NULL (nunca foi calculado)
     * - OU têm precoCustoUnitario preenchido mas ivaCompra = NULL
     * <p>
     * Usa a mesma lógica de cálculo do método {@link #criar}.
     */
    @Transactional
    public int recalcularIvaMovimentosExistentes() {
        Empresa empresa = getCurrentEmpresa();
        ConfiguracaoFiscal config = configuracaoFiscalRepository
                .findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());
        boolean regimePermiteDeducao = config.getRegimeIva() == null
                || config.getRegimeIva() == RegimeIva.GERAL;

        if (!regimePermiteDeducao) {
            return 0; // Regime não permite dedução
        }

        List<MovimentoEstoque> movimentos = movimentoEstoqueRepository
                .findByEmpresaAndTipoMovimentoAndFornecedorIsNotNullAndIvaCompraIsNull(empresa);

        int count = 0;
        for (MovimentoEstoque m : movimentos) {
            BigDecimal precoUnitario = m.getPrecoCustoUnitario();
            if (precoUnitario == null || precoUnitario.compareTo(BigDecimal.ZERO) <= 0) {
                // Tentar obter do artigo
                Artigo artigo = m.getArtigo();
                if (artigo != null && artigo.getPrecoCusto() != null
                        && artigo.getPrecoCusto().compareTo(BigDecimal.ZERO) > 0) {
                    precoUnitario = artigo.getPrecoCusto();
                }
            }

            if (precoUnitario != null && precoUnitario.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal taxaIva = m.getArtigo().getTaxaIva() != null
                        ? m.getArtigo().getTaxaIva()
                        : (config.getTaxaIva() != null ? config.getTaxaIva() : BigDecimal.valueOf(14));

                BigDecimal iva = precoUnitario
                        .multiply(BigDecimal.valueOf(m.getQuantidade()))
                        .multiply(taxaIva)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                m.setPrecoCustoUnitario(precoUnitario);
                m.setIvaCompra(iva);
                movimentoEstoqueRepository.save(m);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public MovimentoEstoqueResponse criar(MovimentoEstoqueRequest request) {
        Usuario usuarioLogado = getCurrentUsuario();
        Empresa empresa = usuarioLogado.getEmpresa();

        Artigo artigo = artigoRepository.findById(request.getArtigoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Artigo não encontrado: " + request.getArtigoId()));

        if (!artigo.getEmpresa().getId().equals(empresa.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Acesso negado: Este artigo pertence a outra empresa.");
        }

        String tipoMovimento = request.getTipoMovimento().toUpperCase();
        if (!List.of("ENTRADA", "SAIDA", "AJUSTE", "DEVOLUCAO").contains(tipoMovimento)) {
            throw new IllegalArgumentException("Tipo de movimento inválido: " + tipoMovimento);
        }

        Integer stockAntes = artigo.getStock();
        Integer quantidade = request.getQuantidade();
        Integer stockDepois;

        switch (tipoMovimento) {
            case "ENTRADA":
            case "DEVOLUCAO":
                stockDepois = stockAntes + quantidade;
                break;
            case "SAIDA":
            case "AJUSTE":
                if (stockAntes < quantidade) {
                    throw new IllegalArgumentException(
                            "Stock insuficiente. Stock atual: " + stockAntes
                                    + ", quantidade pretendida: " + quantidade);
                }
                stockDepois = stockAntes - quantidade;
                break;
            default:
                throw new IllegalArgumentException("Tipo de movimento inválido: " + tipoMovimento);
        }

        artigo.setStock(stockDepois);
        artigo.atualizarEstado();
        artigoRepository.save(artigo);

        Fornecedor fornecedor = null;
        if (request.getFornecedorId() != null) {
            fornecedor = fornecedorRepository.findById(request.getFornecedorId()).orElse(null);
        }

        // ─── Calcular IVA Dedutível nas entradas com fornecedor ──────────────────
        BigDecimal precoCustoUnitario = null;
        BigDecimal ivaCompra = null;

        if ("ENTRADA".equals(tipoMovimento) && fornecedor != null) {
            // Verificar se a empresa está no Regime Geral (só este regime permite dedução - Art. 19.º CIVA)
            ConfiguracaoFiscal config = configuracaoFiscalRepository
                    .findByEmpresa(empresa).orElse(new ConfiguracaoFiscal());
            boolean regimePermiteDeducao = config.getRegimeIva() == null
                    || config.getRegimeIva() == RegimeIva.GERAL;

            if (regimePermiteDeducao) {
                // ─── Prioridade para obter o precoCustoUnitario ─────────────────────
                // 1. Valor enviado no request (pelo utilizador no formulário)
                // 2. Fallback: precoCusto do artigo APENAS se for um valor positivo (> 0)
                //    (Evita usar 0 de artigos antigos que foi criado pelo bug anterior)
                // 3. Se ambos forem inválidos → null → IVA não é calculado
                BigDecimal precoRequest = request.getPrecoCustoUnitario();
                BigDecimal precoArtigo   = artigo.getPrecoCusto();

                if (precoRequest != null) {
                    precoCustoUnitario = precoRequest;
                } else if (precoArtigo != null && precoArtigo.compareTo(BigDecimal.ZERO) > 0) {
                    precoCustoUnitario = precoArtigo;
                } else {
                    precoCustoUnitario = null;
                }

                // Só calcular IVA se houver um valor positivo de custo
                if (precoCustoUnitario != null && precoCustoUnitario.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal taxaIva = artigo.getTaxaIva() != null
                            ? artigo.getTaxaIva()
                            : (config.getTaxaIva() != null ? config.getTaxaIva() : BigDecimal.valueOf(14));

                    // IVA Dedutível = preço custo unitário × quantidade × taxa IVA / 100
                    ivaCompra = precoCustoUnitario
                            .multiply(BigDecimal.valueOf(quantidade))
                            .multiply(taxaIva)
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    // Atualizar o precoCusto do artigo com o valor usado no movimento
                    artigo.setPrecoCusto(precoCustoUnitario);
                    artigoRepository.save(artigo);
                }
            }
        }

        MovimentoEstoque movimento = MovimentoEstoque.builder()
                .artigo(artigo)
                .quantidade(quantidade)
                .tipoMovimento(tipoMovimento)
                .observacao(request.getObservacao())
                .fornecedor(fornecedor)
                .dataHora(LocalDateTime.now())
                .usuario(usuarioLogado.getNome() + " (" + usuarioLogado.getEmail() + ")")
                .empresa(empresa)
                .stockAntes(stockAntes)
                .stockDepois(stockDepois)
                .precoCustoUnitario(precoCustoUnitario)
                .ivaCompra(ivaCompra)
                .build();

        movimento = movimentoEstoqueRepository.save(movimento);
        return toResponse(movimento);
    }

    private MovimentoEstoqueResponse toResponse(MovimentoEstoque movimento) {
        return MovimentoEstoqueResponse.builder()
                .id(movimento.getId())
                .artigoId(movimento.getArtigo().getId())
                .artigoNome(movimento.getArtigo().getNome())
                .quantidade(movimento.getQuantidade())
                .tipoMovimento(movimento.getTipoMovimento())
                .observacao(movimento.getObservacao())
                .fornecedorNome(movimento.getFornecedor() != null ? movimento.getFornecedor().getNome() : null)
                .dataHora(movimento.getDataHora())
                .usuario(movimento.getUsuario())
                .stockAntes(movimento.getStockAntes())
                .stockDepois(movimento.getStockDepois())
                .ivaCompra(movimento.getIvaCompra())
                .build();
    }
}


