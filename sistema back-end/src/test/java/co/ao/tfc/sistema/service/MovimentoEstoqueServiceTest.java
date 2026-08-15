package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.MovimentoEstoqueRequest;
import co.ao.tfc.sistema.dto.MovimentoEstoqueResponse;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.ConfiguracaoFiscal;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Fornecedor;
import co.ao.tfc.sistema.model.MovimentoEstoque;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.ConfiguracaoFiscalRepository;
import co.ao.tfc.sistema.repository.FornecedorRepository;
import co.ao.tfc.sistema.repository.MovimentoEstoqueRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovimentoEstoqueServiceTest {

    @Mock private MovimentoEstoqueRepository movimentoEstoqueRepository;
    @Mock private ArtigoRepository artigoRepository;
    @Mock private FornecedorRepository fornecedorRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ConfiguracaoFiscalRepository configuracaoFiscalRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private MovimentoEstoqueService movimentoEstoqueService;

    private Empresa empresaMock;
    private Usuario usuarioMock;
    private Artigo artigoMock;
    private Fornecedor fornecedorMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);
        empresaMock.setNome("Empresa Teste");

        usuarioMock = new Usuario();
        usuarioMock.setNome("Admin");
        usuarioMock.setEmail("admin@empresa.com");
        usuarioMock.setEmpresa(empresaMock);

        artigoMock = Artigo.builder()
                .id(1L)
                .nome("Notebook")
                .sku("SKU-NB")
                .preco(BigDecimal.valueOf(1000))
                .precoCusto(BigDecimal.valueOf(800))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(10)
                .stockMinimo(2)
                .estado(EstadoArtigo.EM_STOCK)
                .empresa(empresaMock)
                .build();

        fornecedorMock = Fornecedor.builder()
                .id(1L)
                .nome("Fornecedor Teste")
                .nif("500000222")
                .ativo(true)
                .empresa(empresaMock)
                .build();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("admin@empresa.com");
        when(usuarioRepository.findByEmail("admin@empresa.com")).thenReturn(Optional.of(usuarioMock));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private MovimentoEstoqueRequest request(String tipo, int quantidade, Long fornecedorId) {
        MovimentoEstoqueRequest request = new MovimentoEstoqueRequest();
        request.setArtigoId(1L);
        request.setTipoMovimento(tipo);
        request.setQuantidade(quantidade);
        request.setFornecedorId(fornecedorId);
        return request;
    }

    /**
     * ENTRADA: stock 10 + 5 = 15; stockAntes/Depois gravados no movimento.
     */
    @Test
    void testEntradaIncrementaStock() {
        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));
        when(movimentoEstoqueRepository.save(any(MovimentoEstoque.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(request("ENTRADA", 5, null));

        assertEquals(15, artigoMock.getStock());
        assertEquals(10, response.getStockAntes());
        assertEquals(15, response.getStockDepois());
        assertEquals("ENTRADA", response.getTipoMovimento());
        verify(artigoRepository).save(artigoMock);
    }

    /**
     * SAIDA: stock 10 - 3 = 7.
     */
    @Test
    void testSaidaDecrementaStock() {
        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));
        when(movimentoEstoqueRepository.save(any(MovimentoEstoque.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(request("SAIDA", 3, null));

        assertEquals(7, artigoMock.getStock());
        assertEquals(10, response.getStockAntes());
        assertEquals(7, response.getStockDepois());
    }

    /**
     * SAIDA com quantidade superior ao stock → exceção e stock inalterado.
     */
    @Test
    void testSaidaStockInsuficienteLancaErro() {
        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> movimentoEstoqueService.criar(request("SAIDA", 15, null)));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
        assertEquals(10, artigoMock.getStock());
        verify(movimentoEstoqueRepository, never()).save(any());
    }

    /**
     * Tipo de movimento inválido → exceção.
     */
    @Test
    void testTipoMovimentoInvalidoLancaErro() {
        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> movimentoEstoqueService.criar(request("TRANSFERENCIA", 1, null)));

        assertTrue(ex.getMessage().contains("Tipo de movimento inválido"));
    }

    /**
     * ENTRADA com fornecedor em Regime Geral calcula IVA dedutível:
     * 1000 × 2 × 14% = 280.
     */
    @Test
    void testEntradaRegimeGeralCalculaIvaDedutivel() {
        ConfiguracaoFiscal config = ConfiguracaoFiscal.builder()
                .regimeIva(RegimeIva.GERAL)
                .taxaIva(BigDecimal.valueOf(14))
                .empresa(empresaMock)
                .build();

        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedorMock));
        when(configuracaoFiscalRepository.findByEmpresa(empresaMock)).thenReturn(Optional.of(config));
        when(movimentoEstoqueRepository.save(any(MovimentoEstoque.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentoEstoqueRequest req = request("ENTRADA", 2, 1L);
        req.setPrecoCustoUnitario(BigDecimal.valueOf(1000));

        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(req);

        assertEquals(0, response.getIvaCompra().compareTo(new BigDecimal("280.00")));
        assertEquals("Fornecedor Teste", response.getFornecedorNome());
        // O preço de custo do artigo é atualizado com o valor usado
        assertEquals(0, artigoMock.getPrecoCusto().compareTo(BigDecimal.valueOf(1000)));
    }

    /**
     * ENTRADA com fornecedor em Regime Simplificado → sem IVA dedutível (Art. 19.º CIVA).
     */
    @Test
    void testEntradaRegimeSimplificadoSemIvaDedutivel() {
        ConfiguracaoFiscal config = ConfiguracaoFiscal.builder()
                .regimeIva(RegimeIva.SIMPLIFICADO)
                .taxaIva(BigDecimal.valueOf(14))
                .empresa(empresaMock)
                .build();

        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));
        when(fornecedorRepository.findById(1L)).thenReturn(Optional.of(fornecedorMock));
        when(configuracaoFiscalRepository.findByEmpresa(empresaMock)).thenReturn(Optional.of(config));
        when(movimentoEstoqueRepository.save(any(MovimentoEstoque.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentoEstoqueRequest req = request("ENTRADA", 2, 1L);
        req.setPrecoCustoUnitario(BigDecimal.valueOf(1000));

        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(req);

        assertNull(response.getIvaCompra());
    }

    /**
     * ENTRADA sem fornecedor → stock atualizado, mas sem IVA dedutível.
     */
    @Test
    void testEntradaSemFornecedorSemIvaDedutivel() {
        when(artigoRepository.findById(1L)).thenReturn(Optional.of(artigoMock));
        when(movimentoEstoqueRepository.save(any(MovimentoEstoque.class))).thenAnswer(inv -> inv.getArgument(0));

        MovimentoEstoqueResponse response = movimentoEstoqueService.criar(request("ENTRADA", 3, null));

        assertEquals(13, artigoMock.getStock());
        assertNull(response.getIvaCompra());
        assertNull(response.getFornecedorNome());
    }

    /**
     * corrigirArtigosPrecoCustoZero: artigos com preço de custo 0 passam a null.
     */
    @Test
    void testCorrigirArtigosPrecoCustoZero() {
        Artigo artigoZero = Artigo.builder()
                .id(2L)
                .nome("Artigo Bug")
                .sku("SKU-BUG")
                .preco(BigDecimal.valueOf(500))
                .precoCusto(BigDecimal.ZERO)
                .taxaIva(BigDecimal.valueOf(14))
                .stock(3)
                .stockMinimo(1)
                .estado(EstadoArtigo.EM_STOCK)
                .empresa(empresaMock)
                .build();

        when(artigoRepository.findByEmpresaAndPrecoCusto(empresaMock, BigDecimal.ZERO))
                .thenReturn(List.of(artigoZero));

        int corrigidos = movimentoEstoqueService.corrigirArtigosPrecoCustoZero();

        assertEquals(1, corrigidos);
        assertNull(artigoZero.getPrecoCusto());
        verify(artigoRepository).saveAll(List.of(artigoZero));
    }

    /**
     * recalcularIvaMovimentosExistentes: movimentos ENTRADA sem IVA passam a ter
     * IVA calculado a partir do preço de custo do artigo (800 × 2 × 14% = 224).
     */
    @Test
    void testRecalcularIvaMovimentosExistentes() {
        ConfiguracaoFiscal config = ConfiguracaoFiscal.builder()
                .regimeIva(RegimeIva.GERAL)
                .taxaIva(BigDecimal.valueOf(14))
                .empresa(empresaMock)
                .build();

        MovimentoEstoque movimento = MovimentoEstoque.builder()
                .id(1L)
                .artigo(artigoMock)
                .quantidade(2)
                .tipoMovimento("ENTRADA")
                .fornecedor(fornecedorMock)
                .precoCustoUnitario(null)
                .ivaCompra(null)
                .empresa(empresaMock)
                .build();

        when(configuracaoFiscalRepository.findByEmpresa(empresaMock)).thenReturn(Optional.of(config));
        when(movimentoEstoqueRepository.findByEmpresaAndTipoMovimentoAndFornecedorIsNotNullAndIvaCompraIsNull(empresaMock))
                .thenReturn(List.of(movimento));
        when(movimentoEstoqueRepository.save(movimento)).thenReturn(movimento);

        int recalculados = movimentoEstoqueService.recalcularIvaMovimentosExistentes();

        assertEquals(1, recalculados);
        assertEquals(0, movimento.getIvaCompra().compareTo(new BigDecimal("224.00")));
        assertEquals(0, movimento.getPrecoCustoUnitario().compareTo(BigDecimal.valueOf(800)));
    }

    /**
     * recalcularIvaMovimentosExistentes em Regime Simplificado → nada é recalculado.
     */
    @Test
    void testRecalcularIvaRegimeSimplificadoNaoRecalcula() {
        ConfiguracaoFiscal config = ConfiguracaoFiscal.builder()
                .regimeIva(RegimeIva.SIMPLIFICADO)
                .taxaIva(BigDecimal.valueOf(14))
                .empresa(empresaMock)
                .build();

        when(configuracaoFiscalRepository.findByEmpresa(empresaMock)).thenReturn(Optional.of(config));

        int recalculados = movimentoEstoqueService.recalcularIvaMovimentosExistentes();

        assertEquals(0, recalculados);
        verify(movimentoEstoqueRepository, never()).save(any());
    }
}
