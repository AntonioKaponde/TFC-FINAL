package co.ao.tfc.sistema.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class NotaCreditoResponse {
    private Long id;
    private String numero;
    private Long faturaId;
    private String faturaNumero;
    private String clienteNome;
    private String motivo;
    private BigDecimal valor;
    private LocalDate dataEmissao;
}
