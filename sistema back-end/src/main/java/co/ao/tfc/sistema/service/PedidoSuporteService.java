package co.ao.tfc.sistema.service;

import co.ao.tfc.sistema.dto.NaoLidosResponse;
import co.ao.tfc.sistema.dto.PedidoSuporteRequest;
import co.ao.tfc.sistema.dto.PedidoSuporteResponse;
import co.ao.tfc.sistema.model.AnexoSuporte;
import co.ao.tfc.sistema.model.Empresa;
import co.ao.tfc.sistema.model.PedidoSuporte;
import co.ao.tfc.sistema.model.Usuario;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import co.ao.tfc.sistema.repository.AnexoSuporteRepository;
import co.ao.tfc.sistema.repository.PedidoSuporteRepository;
import co.ao.tfc.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PedidoSuporteService {

    private static final Logger log = LoggerFactory.getLogger(PedidoSuporteService.class);

    private static final String PASTA_ANEXOS = "pedidos-suporte";

    /** Número máximo de anexos por pedido. */
    private static final int MAX_ANEXOS = 5;

    /** Tipos de ficheiro permitidos (imagens e documentos comuns). */
    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp",
            "application/pdf",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain");

    /** Extensões permitidas como fallback quando o browser envia application/octet-stream. */
    private static final Set<String> EXTENSOES_PERMITIDAS = Set.of(
            ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp",
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt");

    private final PedidoSuporteRepository pedidoSuporteRepository;
    private final AnexoSuporteRepository anexoSuporteRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.uploads.dir:uploads}")
    private String diretorioUploads;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private Usuario getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador não autenticado"));
    }

    private boolean isAdmin(Usuario usuario) {
        return usuario.getPerfilRoles().stream()
                .anyMatch(r -> r.getNome().equalsIgnoreCase("Admin") || r.getNome().equalsIgnoreCase("NovoAdmin"));
    }

    private Path getPastaAnexos() throws IOException {
        Path pasta = Paths.get(diretorioUploads, PASTA_ANEXOS).toAbsolutePath().normalize();
        Files.createDirectories(pasta);
        return pasta;
    }

    // ---------------------------------------------------------------------
    // Criar pedido (utilizador)
    // ---------------------------------------------------------------------

    @Transactional
    public PedidoSuporteResponse criar(PedidoSuporteRequest request) {
        Usuario utilizador = getCurrentUser();
        Empresa empresa = utilizador.getEmpresa();

        PedidoSuporte pedido = PedidoSuporte.builder()
                .assunto(request.getAssunto().trim())
                .descricao(request.getDescricao().trim())
                .categoria(request.getCategoria())
                .prioridade(request.getPrioridade())
                .estado(EstadoSuporte.ABERTO)
                .nomeUtilizador(utilizador.getNome())
                .emailUtilizador(utilizador.getEmail())
                .dataCriacao(LocalDateTime.now())
                .empresa(empresa)
                .build();

        if (request.getAnexos() != null) {
            List<MultipartFile> anexosValidos = request.getAnexos().stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .toList();
            if (anexosValidos.size() > MAX_ANEXOS) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Pode anexar no máximo " + MAX_ANEXOS + " ficheiros.");
            }
            // Validação em duas passagens: primeiro todos os tipos, depois escreve em disco.
            for (MultipartFile ficheiro : anexosValidos) {
                if (!tipoPermitido(ficheiro)) {
                    String contentType = ficheiro.getContentType();
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Tipo de ficheiro não permitido: " + (contentType == null ? "desconhecido" : contentType) +
                                    ". Use imagens, PDF, Word, Excel ou texto.");
                }
            }
            for (MultipartFile ficheiro : anexosValidos) {
                AnexoSuporte anexo = guardarAnexo(ficheiro, pedido);
                pedido.adicionarAnexo(anexo);
            }
        }

        PedidoSuporte salvo = pedidoSuporteRepository.save(pedido);
        return toResponse(salvo);
    }

    /**
     * Aceita o ficheiro se o content-type estiver na lista, ou se vier como
     * application/octet-stream mas com uma extensão de ficheiro permitida.
     */
    private boolean tipoPermitido(MultipartFile ficheiro) {
        String contentType = ficheiro.getContentType();
        if (contentType != null && TIPOS_PERMITIDOS.contains(contentType.toLowerCase())) {
            return true;
        }
        if (contentType == null || "application/octet-stream".equalsIgnoreCase(contentType)) {
            String nome = ficheiro.getOriginalFilename();
            if (nome == null) return false;
            String nomeMinusculo = nome.toLowerCase();
            return EXTENSOES_PERMITIDAS.stream().anyMatch(nomeMinusculo::endsWith);
        }
        return false;
    }

    private AnexoSuporte guardarAnexo(MultipartFile ficheiro, PedidoSuporte pedido) {
        try {
            String nomeOriginal = ficheiro.getOriginalFilename() == null || ficheiro.getOriginalFilename().isBlank()
                    ? "anexo" : ficheiro.getOriginalFilename();

            String extensao = "";
            int ponto = nomeOriginal.lastIndexOf('.');
            if (ponto > 0) {
                extensao = nomeOriginal.substring(ponto).toLowerCase();
            }
            String nomeArmazenado = UUID.randomUUID() + extensao;

            Path destino = getPastaAnexos().resolve(nomeArmazenado).normalize();
            ficheiro.transferTo(destino.toFile());

            return AnexoSuporte.builder()
                    .nomeOriginal(nomeOriginal)
                    .nomeArmazenado(nomeArmazenado)
                    .tipoConteudo(ficheiro.getContentType() != null ? ficheiro.getContentType() : "application/octet-stream")
                    .tamanho(ficheiro.getSize())
                    .pedido(pedido)
                    .build();
        } catch (IOException e) {
            log.error("Falha ao guardar anexo do pedido de suporte", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao guardar o anexo: " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // Listagens
    // ---------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<PedidoSuporteResponse> listarMeus() {
        Usuario utilizador = getCurrentUser();
        return pedidoSuporteRepository.findComAnexosPorEmpresaEUtilizador(utilizador.getEmpresa(), utilizador.getEmail())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoSuporteResponse> listarTodos(EstadoSuporte estado) {
        Usuario utilizador = getCurrentUser();
        if (!isAdmin(utilizador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem gerir pedidos de suporte.");
        }
        List<PedidoSuporte> pedidos = estado != null
                ? pedidoSuporteRepository.findByEmpresaAndEstadoOrderByDataCriacaoDesc(utilizador.getEmpresa(), estado)
                : pedidoSuporteRepository.findComAnexosPorEmpresa(utilizador.getEmpresa());
        return pedidos.stream().map(this::toResponse).toList();
    }

    // ---------------------------------------------------------------------
    // Notificações (não lidos)
    // ---------------------------------------------------------------------

    /**
     * Total de pedidos não visualizados + lista dos mais recentes (campainha/sidebar).
     * Para utilizadores não administradores devolve sempre 0, sem erro.
     */
    @Transactional(readOnly = true)
    public NaoLidosResponse obterNaoLidos() {
        Usuario utilizador = getCurrentUser();
        if (!isAdmin(utilizador)) {
            return NaoLidosResponse.builder().total(0).pedidos(List.of()).build();
        }
        long total = pedidoSuporteRepository.countByEmpresaAndVistoFalse(utilizador.getEmpresa());
        // Mapeamento leve (sem anexos) para evitar o N+1 em cada polling da campainha
        List<PedidoSuporteResponse> pedidos = pedidoSuporteRepository
                .findTop10ByEmpresaAndVistoFalseOrderByDataCriacaoDesc(utilizador.getEmpresa())
                .stream().map(this::toResponseResumo).toList();
        return NaoLidosResponse.builder().total(total).pedidos(pedidos).build();
    }

    /**
     * Marca todos os pedidos não visualizados da empresa como vistos.
     * Chamado quando o administrador abre a gestão de suporte.
     */
    @Transactional
    public int marcarComoVistos() {
        Usuario utilizador = getCurrentUser();
        if (!isAdmin(utilizador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem gerir pedidos de suporte.");
        }
        return pedidoSuporteRepository.marcarTodosComoVistos(utilizador.getEmpresa());
    }

    // ---------------------------------------------------------------------
    // Gestão pelo administrador
    // ---------------------------------------------------------------------

    @Transactional
    public PedidoSuporteResponse atualizarEstado(Long id, EstadoSuporte novoEstado, String observacao) {
        Usuario utilizador = getCurrentUser();
        if (!isAdmin(utilizador)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem gerir pedidos de suporte.");
        }

        PedidoSuporte pedido = pedidoSuporteRepository.findByIdAndEmpresa(id, utilizador.getEmpresa())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido de suporte não encontrado."));

        if (pedido.getEstado() == EstadoSuporte.FECHADO && novoEstado != EstadoSuporte.FECHADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um pedido fechado não pode ser reaberto.");
        }
        if (pedido.getEstado() == EstadoSuporte.CANCELADO && novoEstado != EstadoSuporte.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um pedido cancelado não pode ser reativado.");
        }

        pedido.setEstado(novoEstado);
        if (observacao != null && !observacao.isBlank()) {
            pedido.setObservacao(observacao.trim());
        }
        pedido.setDataAtualizacao(LocalDateTime.now());
        return toResponse(pedidoSuporteRepository.save(pedido));
    }

    // ---------------------------------------------------------------------
    // Anexos
    // ---------------------------------------------------------------------

    /**
     * Resultado do download de um anexo: metadados + recurso do ficheiro.
     */
    public record AnexoDownload(AnexoSuporte anexo, Resource recurso) {}

    /**
     * Devolve o ficheiro anexo (com metadados), validando que pertence a um
     * pedido da empresa do utilizador autenticado.
     */
    @Transactional(readOnly = true)
    public AnexoDownload obterAnexo(Long anexoId) {
        Usuario utilizador = getCurrentUser();
        AnexoSuporte anexo = anexoSuporteRepository.findById(anexoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anexo não encontrado."));

        PedidoSuporte pedido = anexo.getPedido();
        if (pedido == null || !pedido.getEmpresa().getId().equals(utilizador.getEmpresa().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a este anexo.");
        }

        try {
            Path ficheiro = getPastaAnexos().resolve(anexo.getNomeArmazenado()).normalize();
            Resource resource = new UrlResource(ficheiro.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "O ficheiro do anexo já não existe no servidor.");
            }
            return new AnexoDownload(anexo, resource);
        } catch (IOException e) {
            log.error("Falha ao ler anexo {}", anexoId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao ler o anexo.");
        }
    }

    // ---------------------------------------------------------------------
    // Mapeamento
    // ---------------------------------------------------------------------

    /**
     * Resumo leve usado nas notificações (sem anexos — evita lazy loads em cada polling).
     */
    private PedidoSuporteResponse toResponseResumo(PedidoSuporte pedido) {
        return PedidoSuporteResponse.builder()
                .id(pedido.getId())
                .codigo(String.format("#%03d", pedido.getId()))
                .assunto(pedido.getAssunto())
                .descricao(pedido.getDescricao())
                .categoria(pedido.getCategoria())
                .prioridade(pedido.getPrioridade())
                .estado(pedido.getEstado())
                .dataCriacao(pedido.getDataCriacao())
                .anexos(List.of())
                .build();
    }

    private PedidoSuporteResponse toResponse(PedidoSuporte pedido) {
        return PedidoSuporteResponse.builder()
                .id(pedido.getId())
                .codigo(String.format("#%03d", pedido.getId()))
                .assunto(pedido.getAssunto())
                .descricao(pedido.getDescricao())
                .categoria(pedido.getCategoria())
                .prioridade(pedido.getPrioridade())
                .estado(pedido.getEstado())
                .observacao(pedido.getObservacao())
                .nomeUtilizador(pedido.getNomeUtilizador())
                .emailUtilizador(pedido.getEmailUtilizador())
                .dataCriacao(pedido.getDataCriacao())
                .dataAtualizacao(pedido.getDataAtualizacao())
                .anexos(pedido.getAnexos() == null ? List.of() : pedido.getAnexos().stream()
                        .map(a -> PedidoSuporteResponse.AnexoResponse.builder()
                                .id(a.getId())
                                .nomeOriginal(a.getNomeOriginal())
                                .tipoConteudo(a.getTipoConteudo())
                                .tamanho(a.getTamanho())
                                .build())
                        .toList())
                .build();
    }
}
