package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class NotaCreditoRequest {
    @NotNull(message = "O ID da fatura é obrigatório")
    private Long faturaId;

    @NotBlank(message = "O motivo é obrigatório")
    private String motivo;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser positivo")
    private BigDecimal valor;
}
