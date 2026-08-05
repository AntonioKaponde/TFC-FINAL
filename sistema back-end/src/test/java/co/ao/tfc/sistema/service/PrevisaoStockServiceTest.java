package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.PrevisaoStockResponse;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.EstadoArtigo;
import co.ao.tfc.sistema.repository.ArtigoRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrevisaoStockServiceTest {

    @Mock
    private ArtigoRepository artigoRepository;
    @Mock
    private FaturaRepository faturaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private PrevisaoStockService previsaoStockService;

    private Usuario usuarioMock;
    private Empresa empresaMock;
    private Categoria categoriaMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);

        categoriaMock = Categoria.builder().id(1L).nome("Equipamentos").build();

        usuarioMock = new Usuario();
        usuarioMock.setEmail("teste@empresa.com");
        usuarioMock.setEmpresa(empresaMock);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("teste@empresa.com");
        when(usuarioRepository.findByEmail("teste@empresa.com")).thenReturn(Optional.of(usuarioMock));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Artigo artigo(String nome, int stock, int stockMinimo) {
        return Artigo.builder()
                .id((long) nome.hashCode())
                .nome(nome)
                .sku("SKU-" + nome)
                .categoria(categoriaMock)
                .preco(BigDecimal.valueOf(1000))
                .stock(stock)
                .stockMinimo(stockMinimo)
                .estado(EstadoArtigo.EM_STOCK)
                .empresa(empresaMock)
                .build();
    }

    /**
     * Vendas: 30 unidades em 90 dias → consumo mensal 10. Stock 5 → dias restantes ~15 → A_ACABAR,
     * com sugestão de reposição > 0.
     */
    @Test
    void testArtigoVaiAcabar() {
        Artigo artigo = artigo("Notebook HP", 5, 10);
        when(artigoRepository.findByEmpresa(empresaMock)).thenReturn(List.of(artigo));
        when(faturaRepository.resumoVendasPorArtigo(empresaMock, LocalDate.now().minusDays(90)))
                .thenReturn(List.<Object[]>of(new Object[]{artigo.getId(), 30L, LocalDate.now().minusDays(2), 3L}));

        PrevisaoStockResponse response = previsaoStockService.obterPrevisao();

        PrevisaoStockResponse.ArtigoPrevisaoDTO previsao = response.getArtigos().get(0);
        assertEquals("A_ACABAR", previsao.getStatus());
        assertEquals(10.0, previsao.getConsumoMensal().doubleValue(), 0.01);
        assertTrue(previsao.getDiasRestantes() <= 15);
        assertTrue(previsao.getSugestaoReposicao() > 0);
        assertEquals(1, response.getResumo().getAAcabar());
    }

    /**
     * Sem vendas nos últimos 90 dias → produto parado, sem sugestão de reposição.
     */
    @Test
    void testArtigoParadoSemVendas() {
        Artigo artigo = artigo("Impressora", 40, 5);
        when(artigoRepository.findByEmpresa(empresaMock)).thenReturn(List.of(artigo));
        when(faturaRepository.resumoVendasPorArtigo(empresaMock, LocalDate.now().minusDays(90)))
                .thenReturn(List.of());

        PrevisaoStockResponse response = previsaoStockService.obterPrevisao();

        PrevisaoStockResponse.ArtigoPrevisaoDTO previsao = response.getArtigos().get(0);
        assertEquals("PARADO", previsao.getStatus());
        assertEquals(0, previsao.getSugestaoReposicao());
        assertEquals("SEM_VENDAS", previsao.getVelocidade());
        assertEquals(1, response.getResumo().getParados());
    }

    /**
     * Stock nulo (serviços) não pode causar NPE e é tratado como sem stock.
     */
    @Test
    void testArtigoComStockNuloNaoFalha() {
        Artigo artigo = artigo("Serviço de instalação", 0, 0);
        artigo.setStock(null);
        when(artigoRepository.findByEmpresa(empresaMock)).thenReturn(List.of(artigo));
        when(faturaRepository.resumoVendasPorArtigo(empresaMock, LocalDate.now().minusDays(90)))
                .thenReturn(List.of());

        PrevisaoStockResponse response = previsaoStockService.obterPrevisao();

        assertEquals("SEM_STOCK", response.getArtigos().get(0).getStatus());
    }
}
