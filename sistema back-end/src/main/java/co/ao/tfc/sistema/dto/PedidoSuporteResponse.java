package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.CategoriaSuporte;
import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import co.ao.tfc.sistema.model.enums.PrioridadeSuporte;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PedidoSuporteResponse {
    private Long id;
    /** Código apresentável, ex.: #001 */
    private String codigo;
    private String assunto;
    private String descricao;
    private CategoriaSuporte categoria;
    private PrioridadeSuporte prioridade;
    private EstadoSuporte estado;
    private String observacao;
    private String nomeUtilizador;
    private String emailUtilizador;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private List<AnexoResponse> anexos;

    @Data
    @Builder
    public static class AnexoResponse {
        private Long id;
        private String nomeOriginal;
        private String tipoConteudo;
        private Long tamanho;
    }
}
