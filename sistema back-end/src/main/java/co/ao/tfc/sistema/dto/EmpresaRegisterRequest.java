package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EmpresaRegisterRequest {
    private String nome;
    
    @jakarta.validation.constraints.NotBlank(message = "O NIF da empresa é obrigatório")
    @jakarta.validation.constraints.Pattern(regexp = "^5\\d{9}$", message = "O NIF da Empresa deve conter 10 dígitos e começar por 5.")
    private String nif;
    private String endereco;
    private String telefone;
    private TipoEmpresa tipoEmpresa;
    private RegimeIva regimeIva;
    private LocalDate anoFiscal = LocalDate.now();

}
