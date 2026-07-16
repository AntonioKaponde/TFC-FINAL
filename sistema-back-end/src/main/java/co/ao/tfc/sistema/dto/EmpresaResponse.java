package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.*;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class EmpresaResponse {
    private String nome;
    private String nif;
    private String endereco;
    private String telefone;
    private TipoEmpresa tipoEmpresa;
    private RegimeIva regimeIva;

}
