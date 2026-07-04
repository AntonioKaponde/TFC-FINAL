package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.IsencaoIva;
import co.ao.tfc.sistema.model.enums.RegimeIva;
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
    
    @jakarta.validation.constraints.Pattern(regexp = "^$|^9\\d{8}$", message = "O telefone deve ter 9 dígitos e começar com 9.")
    private String telefone;
    
    @jakarta.validation.constraints.Email(message = "Email inválido")
    @jakarta.validation.constraints.Pattern(regexp = ".*@gmail\\.com$", message = "O email deve ser um endereço @gmail.com")
    private String email;
    private BigDecimal capitalSocial;

    private RegimeIva regimeIva;

    private IsencaoIva iva;

    private String prefixoFatura;
}
