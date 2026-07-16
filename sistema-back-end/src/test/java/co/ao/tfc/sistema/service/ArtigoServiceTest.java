package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ArtigoRequest;
import co.ao.tfc.sistema.dto.ArtigoResponse;
import co.ao.tfc.sistema.model.Artigo;
import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.ArtigoRepository;
import co.ao.tfc.sistema.repository.CategoriaRepository;
import co.ao.tfc.sistema.repository.FornecedorRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArtigoServiceTest {

    @Mock
    private ArtigoRepository artigoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private FornecedorRepository fornecedorRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ArtigoService artigoService;

    private Usuario usuarioMock;
    private Empresa empresaMock;
    private Categoria categoriaMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);
        empresaMock.setNome("Empresa Teste");

        usuarioMock = new Usuario();
        usuarioMock.setEmail("teste@empresa.com");
        usuarioMock.setEmpresa(empresaMock);

        categoriaMock = Categoria.builder().id(1L).nome("Eletrônicos").empresa(empresaMock).build();

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("teste@empresa.com");
        when(usuarioRepository.findByEmail("teste@empresa.com")).thenReturn(Optional.of(usuarioMock));
    }

    @Test
    void testCriarArtigo() {
        mockSecurityContext();

        ArtigoRequest request = new ArtigoRequest();
        request.setNome("Notebook Dell");
        request.setCategoriaId(1L);
        request.setPreco(new BigDecimal("5000.00"));
        request.setPrecoCusto(new BigDecimal("4000.00"));
        request.setTaxaIva(14.0);
        request.setStock(10);
        request.setStockMinimo(5);
        request.setUnidadeMedida("UN");

        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoriaMock));
        when(artigoRepository.existsByNomeIgnoreCaseAndEmpresa("Notebook Dell", empresaMock)).thenReturn(false);

        Artigo artigoSalvo = Artigo.builder()
                .id(1L)
                .nome("Notebook Dell")
                .categoria(categoriaMock)
                .preco(new BigDecimal("5000.00"))
                .stock(10)
                .estado("Em Stock")
                .empresa(empresaMock)
                .build();

        when(artigoRepository.save(any(Artigo.class))).thenReturn(artigoSalvo);

        ArtigoResponse response = artigoService.criar(request);

        assertNotNull(response);
        assertEquals("Notebook Dell", response.getNome());
        assertEquals("Em Stock", response.getEstado());
        verify(artigoRepository, times(1)).save(any(Artigo.class));
    }
}
