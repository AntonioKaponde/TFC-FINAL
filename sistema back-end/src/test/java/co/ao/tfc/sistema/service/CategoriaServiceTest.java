package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.CategoriaRequest;
import co.ao.tfc.sistema.dto.CategoriaResponse;
import co.ao.tfc.sistema.model.Categoria;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.CategoriaRepository;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CategoriaService categoriaService;

    private Usuario usuarioMock;
    private Empresa empresaMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);
        empresaMock.setNome("Empresa Teste");

        usuarioMock = new Usuario();
        usuarioMock.setEmail("teste@empresa.com");
        usuarioMock.setEmpresa(empresaMock);

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
    void testCriarCategoria() {
        mockSecurityContext();

        CategoriaRequest request = new CategoriaRequest();
        request.setNome("Eletrônicos");
        request.setDescricao("Produtos eletrônicos");

        Categoria categoriaSalva = Categoria.builder()
                .id(1L)
                .nome("Eletrônicos")
                .descricao("Produtos eletrônicos")
                .empresa(empresaMock)
                .build();

        when(categoriaRepository.save(any(Categoria.class))).thenReturn(categoriaSalva);

        CategoriaResponse response = categoriaService.criar(request);

        assertNotNull(response);
        assertEquals("Eletrônicos", response.getNome());
        verify(categoriaRepository, times(1)).save(any(Categoria.class));
    }

    @Test
    void testListarCategorias() {
        mockSecurityContext();

        Categoria c1 = Categoria.builder().id(1L).nome("C1").empresa(empresaMock).build();
        Categoria c2 = Categoria.builder().id(2L).nome("C2").empresa(empresaMock).build();

        when(categoriaRepository.findByEmpresa(empresaMock)).thenReturn(List.of(c1, c2));

        List<CategoriaResponse> responses = categoriaService.listar();

        assertEquals(2, responses.size());
        verify(categoriaRepository, times(1)).findByEmpresa(empresaMock);
    }
}
