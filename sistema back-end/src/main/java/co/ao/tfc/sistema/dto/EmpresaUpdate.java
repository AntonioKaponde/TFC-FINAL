package co.ao.tfc.sistema.dto;

import co.ao.tfc.sistema.model.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class EmpresaUpdate {

   /* private String nome;
    private String nif;
    private TipoEmpresa tipoEmpresa;*/

    private String endereco;
    private String telefone;
    private String email;

    private BigDecimal capitalSocial;

    private RegimeIva regimeIva;

    private IsencaoIva iva;

    private String prefixoFatura;

}
