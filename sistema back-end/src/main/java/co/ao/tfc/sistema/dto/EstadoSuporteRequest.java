package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.EstadoSuporte;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EstadoSuporteRequest {

    @NotNull(message = "O estado é obrigatório")
    private EstadoSuporte estado;

    /** Nota/resposta opcional do administrador */
    private String observacao;
}
