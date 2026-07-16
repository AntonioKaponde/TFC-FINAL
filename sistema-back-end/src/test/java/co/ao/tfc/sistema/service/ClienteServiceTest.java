package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.ClienteRequest;
import co.ao.tfc.sistema.dto.ClienteResponse;
import co.ao.tfc.sistema.model.Cliente;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.repository.ClienteRepository;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ClienteService clienteService;

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
    void testCriarClienteCodigoInicial() {
        mockSecurityContext();

        ClienteRequest request = new ClienteRequest();
        request.setNome("João Silva");
        request.setNif("123456789");
        request.setEmail("joao@silva.com");
        request.setTelefone("923000000");
        request.setAtivo(true);

        when(clienteRepository.findTopByEmpresaOrderByCodigoClienteDesc(empresaMock)).thenReturn(Optional.empty());

        Cliente clienteSalvo = Cliente.builder()
                .id(1L)
                .nome("João Silva")
                .nif("123456789")
                .codigoCliente("C-000001")
                .empresa(empresaMock)
                .ativo(true)
                .build();

        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteSalvo);

        ClienteResponse response = clienteService.criar(request);

        assertNotNull(response);
        assertEquals("João Silva", response.getNome());
        assertEquals("C-000001", response.getCodigoCliente());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
    }

    @Test
    void testCriarClienteCodigoExistente() {
        mockSecurityContext();

        ClienteRequest request = new ClienteRequest();
        request.setNome("Maria Silva");

        Cliente ultimoCliente = Cliente.builder().codigoCliente("C-000005").build();
        when(clienteRepository.findTopByEmpresaOrderByCodigoClienteDesc(empresaMock)).thenReturn(Optional.of(ultimoCliente));

        Cliente clienteSalvo = Cliente.builder()
                .id(2L)
                .nome("Maria Silva")
                .codigoCliente("C-000006")
                .empresa(empresaMock)
                .build();

        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteSalvo);

        ClienteResponse response = clienteService.criar(request);

        assertNotNull(response);
        assertEquals("C-000006", response.getCodigoCliente());
    }
}
