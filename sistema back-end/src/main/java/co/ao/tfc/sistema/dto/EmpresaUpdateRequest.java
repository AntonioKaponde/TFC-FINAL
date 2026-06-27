package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.ImpostoIndustrial;
import co.ao.tfc.sistema.model.enums.IsencaoIva;
import co.ao.tfc.sistema.model.enums.RegimeIva;
import co.ao.tfc.sistema.model.enums.RetencaoNaFonte;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class EmpresaUpdateRequest {
    private String endereco;
    private String telefone;
    
    @jakarta.validation.constraints.Email(message = "Email inválido")
    @jakarta.validation.constraints.Pattern(regexp = ".*@gmail\\.com$", message = "O email deve ser um endereço @gmail.com")
    private String email;
    private BigDecimal capitalSocial;

    private RegimeIva regimeIva;

    private ImpostoIndustrial industrial;

    private RetencaoNaFonte retencaoNaFonte;

    private IsencaoIva iva;

    private String prefixoFatura;
}
