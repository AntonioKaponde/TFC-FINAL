package co.ao.tfc.sistema.dto;

import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FaturaMensalRequest {

    private Long clienteId;

    private Long artigoId;


    @Size(min = 6, max = 12, message = "São necessárias exactamente12 quantidades (Jan–Dezembro).")
    private List<Integer> quantidades;
}
