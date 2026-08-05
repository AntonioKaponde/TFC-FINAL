package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.NaoLidosResponse;
import co.ao.tfc.sistema.dto.PedidoSuporteRequest;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PedidoSuporte;
import co.ao.tfc.sistema.model.PerfilRole;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.CategoriaSuporte;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import co.ao.tfc.sistema.model.enums.PrioridadeSuporte;
import co.ao.tfc.sistema.repository.AnexoSuporteRepository;
import co.ao.tfc.sistema.repository.PedidoSuporteRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoSuporteServiceTest {

    @Mock
    private PedidoSuporteRepository pedidoSuporteRepository;
    @Mock
    private AnexoSuporteRepository anexoSuporteRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private PedidoSuporteService pedidoSuporteService;

    private Empresa empresaMock;
    private Usuario operadorMock;
    private Usuario adminMock;

    @BeforeEach
    void setUp() {
        empresaMock = new Empresa();
        empresaMock.setId(1L);

        operadorMock = new Usuario();
        operadorMock.setId(1L);
        operadorMock.setEmail("operador@empresa.com");
        operadorMock.setNome("Operador");
        operadorMock.setEmpresa(empresaMock);
        operadorMock.setPerfilRoles(Set.of(PerfilRole.builder().nome("Operador").build()));

        adminMock = new Usuario();
        adminMock.setId(2L);
        adminMock.setEmail("admin@empresa.com");
        adminMock.setNome("Admin");
        adminMock.setEmpresa(empresaMock);
        adminMock.setPerfilRoles(Set.of(PerfilRole.builder().nome("Admin").build()));

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void autenticar(Usuario usuario) {
        when(authentication.getName()).thenReturn(usuario.getEmail());
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
    }

    @Test
    void testListarTodosNegadoParaOperador() {
        autenticar(operadorMock);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> pedidoSuporteService.listarTodos(null));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testAtualizarEstadoNegadoParaOperador() {
        autenticar(operadorMock);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> pedidoSuporteService.atualizarEstado(1L, EstadoSuporte.EM_ANALISE, null));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testCriarComMaisDeCincoAnexosEBarrado() {
        autenticar(operadorMock);

        PedidoSuporteRequest request = new PedidoSuporteRequest();
        request.setAssunto("Erro ao emitir factura");
        request.setDescricao("O sistema apresenta erro ao tentar gerar o PDF.");
        request.setCategoria(CategoriaSuporte.PROBLEMA_TECNICO);
        request.setPrioridade(PrioridadeSuporte.ALTA);

        List<org.springframework.web.multipart.MultipartFile> anexos = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            anexos.add(new MockMultipartFile("anexos", "erro-" + i + ".png", "image/png", new byte[]{1, 2, 3}));
        }
        request.setAnexos(anexos);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> pedidoSuporteService.criar(request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void testObterNaoLidosDevolveZeroParaOperador() {
        autenticar(operadorMock);

        NaoLidosResponse response = pedidoSuporteService.obterNaoLidos();

        assertEquals(0, response.getTotal());
    }

    @Test
    void testObterNaoLidosParaAdmin() {
        autenticar(adminMock);
        when(pedidoSuporteRepository.countByEmpresaAndVistoFalse(empresaMock)).thenReturn(3L);
        when(pedidoSuporteRepository.findTop10ByEmpresaAndVistoFalseOrderByDataCriacaoDesc(empresaMock))
                .thenReturn(List.of(PedidoSuporte.builder().id(1L).assunto("Erro factura").build()));

        NaoLidosResponse response = pedidoSuporteService.obterNaoLidos();

        assertEquals(3, response.getTotal());
        assertEquals(1, response.getPedidos().size());
        assertEquals("Erro factura", response.getPedidos().get(0).getAssunto());
    }

    @Test
    void testMarcarComoVistosPorAdmin() {
        autenticar(adminMock);
        when(pedidoSuporteRepository.marcarTodosComoVistos(empresaMock)).thenReturn(2);

        int marcados = pedidoSuporteService.marcarComoVistos();

        assertEquals(2, marcados);
    }

    @Test
    void testMarcarComoVistosNegadoParaOperador() {
        autenticar(operadorMock);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> pedidoSuporteService.marcarComoVistos());

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testCriarComTipoDeFicheiroNaoPermitidoEBarrado() {
        autenticar(operadorMock);

        PedidoSuporteRequest request = new PedidoSuporteRequest();
        request.setAssunto("Dúvida");
        request.setDescricao("Como exportar o SAF-T?");
        request.setCategoria(CategoriaSuporte.DUVIDA_UTILIZACAO);
        request.setPrioridade(PrioridadeSuporte.MEDIA);

        request.setAnexos(List.of(
                new MockMultipartFile("anexos", "malware.exe", "application/x-msdownload", new byte[]{1})
        ));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> pedidoSuporteService.criar(request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
