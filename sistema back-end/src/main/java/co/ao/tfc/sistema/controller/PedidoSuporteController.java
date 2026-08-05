package co.ao.tfc.sistema.controller;

import co.ao.tfc.sistema.dto.EstadoSuporteRequest;
import co.ao.tfc.sistema.dto.NaoLidosResponse;
import co.ao.tfc.sistema.dto.PedidoSuporteRequest;
import co.ao.tfc.sistema.dto.PedidoSuporteResponse;
import co.ao.tfc.sistema.model.AnexoSuporte;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import co.ao.tfc.sistema.service.AuditoriaService;
import co.ao.tfc.sistema.service.PedidoSuporteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos-suporte")
@RequiredArgsConstructor
public class PedidoSuporteController {

    private final PedidoSuporteService pedidoSuporteService;
    private final AuditoriaService auditoriaService;

    /** Cria um pedido de suporte (qualquer utilizador autenticado). */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PedidoSuporteResponse> criar(
            @RequestParam("assunto") String assunto,
            @RequestParam("descricao") String descricao,
            @RequestParam("categoria") String categoria,
            @RequestParam("prioridade") String prioridade,
            @RequestParam(value = "anexos", required = false) MultipartFile[] anexos) {

        PedidoSuporteRequest request = new PedidoSuporteRequest();
        request.setAssunto(assunto);
        request.setDescricao(descricao);
        request.setCategoria(co.ao.tfc.sistema.model.enums.CategoriaSuporte.valueOf(categoria));
        request.setPrioridade(co.ao.tfc.sistema.model.enums.PrioridadeSuporte.valueOf(prioridade));
        if (anexos != null) {
            request.setAnexos(List.of(anexos));
        }

        PedidoSuporteResponse response = pedidoSuporteService.criar(request);
        auditoriaService.registrarAuditoria("CRIOU", "PedidoSuporte",
                "Criou o pedido de suporte " + response.getCodigo() + " — " + response.getAssunto());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Lista os pedidos do utilizador autenticado. */
    @GetMapping("/meus")
    public List<PedidoSuporteResponse> listarMeus() {
        return pedidoSuporteService.listarMeus();
    }

    /** Lista todos os pedidos da empresa (apenas administrador). */
    @GetMapping
    public List<PedidoSuporteResponse> listarTodos(@RequestParam(required = false) EstadoSuporte estado) {
        return pedidoSuporteService.listarTodos(estado);
    }

    /**
     * Contagem de pedidos não visualizados + lista dos mais recentes.
     * Devolve 0 para utilizadores não administradores.
     */
    @GetMapping("/nao-lidos")
    public NaoLidosResponse obterNaoLidos() {
        return pedidoSuporteService.obterNaoLidos();
    }

    /** Marca todos os pedidos da empresa como visualizados (apenas administrador). */
    @PostMapping("/marcar-vistos")
    public ResponseEntity<String> marcarComoVistos() {
        int marcados = pedidoSuporteService.marcarComoVistos();
        return ResponseEntity.ok(marcados + " pedido(s) marcado(s) como visto(s).");
    }

    /** Atualiza o estado (e observação) de um pedido (apenas administrador). */
    @PutMapping("/{id}/estado")
    public PedidoSuporteResponse atualizarEstado(@PathVariable Long id,
                                                 @Valid @RequestBody EstadoSuporteRequest request) {
        PedidoSuporteResponse response = pedidoSuporteService.atualizarEstado(id, request.getEstado(), request.getObservacao());
        auditoriaService.registrarAuditoria("ATUALIZOU", "PedidoSuporte",
                "Atualizou o pedido " + response.getCodigo() + " para " + response.getEstado());
        return response;
    }

    /** Descarrega um anexo (utilizadores da mesma empresa). */
    @GetMapping("/anexos/{anexoId}")
    public ResponseEntity<Resource> baixarAnexo(@PathVariable Long anexoId) {
        PedidoSuporteService.AnexoDownload download = pedidoSuporteService.obterAnexo(anexoId);
        AnexoSuporte anexo = download.anexo();

        String nomeCodificado = URLEncoder.encode(anexo.getNomeOriginal(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(anexo.getTipoConteudo());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        // Imagens são servidas inline (visualização); os restantes tipos como download.
        String disposicao = (anexo.getTipoConteudo() != null && anexo.getTipoConteudo().startsWith("image/"))
                ? "inline" : "attachment";

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(anexo.getTamanho() != null ? anexo.getTamanho() : 0)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposicao + "; filename*=UTF-8''" + nomeCodificado)
                .body(download.recurso());
    }
}
