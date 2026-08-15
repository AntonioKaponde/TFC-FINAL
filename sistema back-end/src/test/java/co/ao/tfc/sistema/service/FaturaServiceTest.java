package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.FaturaRequest;
import co.ao.tfc.sistema.dto.FaturaResponse;
import co.ao.tfc.sistema.dto.LinhaFaturaRequest;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Fatura;
import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import co.ao.tfc.sistema.model.enums.EstadoFatura;
import co.ao.tfc.sistema.model.enums.TipoDocumento;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.ClienteRepository;
import co.ao.tfc.sistema.repository.FaturaRepository;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FaturaServiceTest {

    @Mock private FaturaRepository faturaRepository;
    @Mock private ArtigoRepository artigoRepository;
    @Mock private ClienteService clienteService;
    @Mock private ClienteRepository clienteRepository;
    @Mock private ArtigoService artigoService;
    @Mock private EmpresaService empresaService;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks private FaturaService faturaService;

    private Empresa empresaMock;
    private Usuario usuarioMock;
    private Cliente clienteMock;
    private Artigo artigoMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);
        empresaMock.setNome("Empresa Teste");

        usuarioMock = new Usuario();
        usuarioMock.setNome("Admin");
        usuarioMock.setEmail("admin@empresa.com");
        usuarioMock.setEmpresa(empresaMock);

        clienteMock = Cliente.builder()
                .id(1L)
                .nome("Cliente Teste")
                .nif("500000111")
                .saldo(BigDecimal.ZERO)
                .codigoCliente("C-000001")
                .empresa(empresaMock)
                .build();

        Categoria categoria = Categoria.builder().id(1L).nome("Equipamentos").build();
        artigoMock = Artigo.builder()
                .id(1L)
                .nome("Notebook")
                .sku("SKU-NB")
                .categoria(categoria)
                .preco(BigDecimal.valueOf(1000))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(10)
                .stockMinimo(2)
                .estado(EstadoArtigo.EM_STOCK)
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

    private FaturaRequest request(boolean pagoPronto, LinhaFaturaRequest... linhas) {
        FaturaRequest request = new FaturaRequest();
        request.setClienteId(1L);
        request.setDataEmissao(LocalDate.now());
        request.setDataVencimento(LocalDate.now().plusDays(30));
        request.setPagoPronto(pagoPronto);
        request.setLinhas(List.of(linhas));
        return request;
    }

    private LinhaFaturaRequest linha(int quantidade) {
        LinhaFaturaRequest linha = new LinhaFaturaRequest();
        linha.setArtigoId(1L);
        linha.setQuantidade(quantidade);
        return linha;
    }

    /**
     * Artigo a 1000 Kz com 14% IVA, quantidade 2:
     * subtotal = 2000, IVA = 280, total = 2280.
     */
    @Test
    void testCriarFaturaCalculaIvaCorretamente() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        FaturaResponse response = faturaService.criar(request(true, linha(2)));

        assertEquals(0, response.getSubtotal().compareTo(new BigDecimal("2000.00")));
        assertEquals(0, response.getTotalIva().compareTo(new BigDecimal("280.00")));
        assertEquals(0, response.getTotal().compareTo(new BigDecimal("2280.00")));
        assertEquals(1, response.getLinhas().size());
        assertEquals(0, response.getLinhas().get(0).getTotalLinha().compareTo(new BigDecimal("2280.00")));
    }

    /**
     * pagoPronto=true sem tipo explícito → FATURA_RECIBO (Art. 7.º Decreto 34/09) e estado PAGO.
     */
    @Test
    void testTipoDocumentoInfereFaturaReciboQuandoPago() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        FaturaResponse response = faturaService.criar(request(true, linha(1)));

        assertEquals(TipoDocumento.FATURA_RECIBO, response.getTipoDocumento());
        assertEquals(EstadoFatura.PAGO, response.getEstado());
    }

    /**
     * pagoPronto=false sem tipo explícito → FATURA (Art. 5.º) e estado PENDENTE,
     * com aumento do saldo (dívida) do cliente.
     */
    @Test
    void testTipoDocumentoInfereFaturaQuandoNaoPagoEAtualizaSaldo() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        FaturaResponse response = faturaService.criar(request(false, linha(2)));

        assertEquals(TipoDocumento.FATURA, response.getTipoDocumento());
        assertEquals(EstadoFatura.PENDENTE, response.getEstado());
        // Total 2280 adicionado à dívida do cliente
        assertEquals(0, clienteMock.getSaldo().compareTo(new BigDecimal("2280.00")));
        verify(clienteRepository).save(clienteMock);
    }

    /**
     * Tipo explícito (FATURA_SIMPLIFICADA) é respeitado mesmo com pagoPronto=true.
     */
    @Test
    void testTipoDocumentoExplicitoRespeitado() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        FaturaRequest request = request(true, linha(1));
        request.setTipoDocumento(TipoDocumento.FATURA_SIMPLIFICADA);

        FaturaResponse response = faturaService.criar(request);

        assertEquals(TipoDocumento.FATURA_SIMPLIFICADA, response.getTipoDocumento());
    }

    /**
     * Stock insuficiente → exceção e stock não é alterado.
     */
    @Test
    void testCriarFaturaStockInsuficienteLancaErro() {
        artigoMock.setStock(1);
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> faturaService.criar(request(true, linha(5))));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
        assertEquals(1, artigoMock.getStock());
        verify(faturaRepository, never()).save(any());
    }

    /**
     * Ao emitir a fatura, o stock do artigo é debitado (10 - 2 = 8).
     */
    @Test
    void testCriarFaturaDebitaStock() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        faturaService.criar(request(true, linha(2)));

        assertEquals(8, artigoMock.getStock());
        verify(artigoRepository).save(artigoMock);
    }

    /**
     * Vários artigos na mesma fatura: os totais são somados.
     */
    @Test
    void testCriarFaturaComDoisArtigosSomaTotais() {
        Artigo segundoArtigo = Artigo.builder()
                .id(2L)
                .nome("Monitor")
                .sku("SKU-MON")
                .preco(BigDecimal.valueOf(500))
                .taxaIva(BigDecimal.valueOf(14))
                .stock(5)
                .stockMinimo(1)
                .estado(EstadoArtigo.EM_STOCK)
                .empresa(empresaMock)
                .build();

        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(artigoService.buscarEntidade(2L)).thenReturn(segundoArtigo);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        LinhaFaturaRequest linha1 = linha(1);      // 1000 × 1 + 14% = 1140
        LinhaFaturaRequest linha2 = new LinhaFaturaRequest();
        linha2.setArtigoId(2L);
        linha2.setQuantidade(2);                    // 500 × 2 + 14% = 1140

        FaturaResponse response = faturaService.criar(request(true, linha1, linha2));

        // subtotal = 1000 + 1000 = 2000; IVA = 140 + 140 = 280; total = 2280
        assertEquals(0, response.getSubtotal().compareTo(new BigDecimal("2000.00")));
        assertEquals(0, response.getTotalIva().compareTo(new BigDecimal("280.00")));
        assertEquals(0, response.getTotal().compareTo(new BigDecimal("2280.00")));
        assertEquals(2, response.getLinhas().size());
    }

    /**
     * Numeração gerada com prefixo do tipo de documento (FT/FR/FS) e ano corrente.
     */
    @Test
    void testGerarNumeroComPrefixoDoTipo() {
        when(clienteService.buscarEntidade(1L)).thenReturn(clienteMock);
        when(artigoService.buscarEntidade(1L)).thenReturn(artigoMock);
        when(faturaRepository.count()).thenReturn(0L);
        when(faturaRepository.save(any(Fatura.class))).thenAnswer(inv -> inv.getArgument(0));

        FaturaResponse response = faturaService.criar(request(true, linha(1)));

        assertTrue(response.getNumero().startsWith("FR " + LocalDate.now().getYear()));
        assertTrue(response.getNumero().endsWith("/0001"));
    }
}
