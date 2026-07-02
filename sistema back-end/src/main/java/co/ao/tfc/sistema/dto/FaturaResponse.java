package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.EstadoFatura;
import co.ao.tfc.sistema.model.enums.MetodoPagamento;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class FaturaResponse {
    private Long id;
    private String numero;
    private String cliente;
    private String nif;
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private EstadoFatura estado;
    private boolean pagoPronto;
    private MetodoPagamento metodoPagamento;
    private BigDecimal subtotal;
    private BigDecimal totalIva;
    private BigDecimal total;
    private List<LinhaFaturaResponse> linhas;
}
