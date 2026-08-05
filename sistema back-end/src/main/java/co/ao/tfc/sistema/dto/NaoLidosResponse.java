package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NaoLidosResponse {
    /** Número total de pedidos não visualizados. */
    private long total;
    /** Pedidos não visualizados mais recentes (para a campainha). */
    private List<PedidoSuporteResponse> pedidos;
}
